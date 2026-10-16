"""OpenAPI 3 description and Postman collection for the HTTP API.

    python3 -m pixelmath.apidocs api/        # rewrites api/openapi.json and api/postman_collection.json
"""
import json
import os
import sys

from . import __version__

ERR = {"description": "Error", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/Error"}}}}


def _err(desc):
    return {"description": desc, "content": ERR["content"]}


def openapi(cfg=None):
    from .server import Config
    cfg = cfg or Config()
    url = "http://127.0.0.1:8000" if not cfg.port else "http://%s:%d" % (
        "[%s]" % cfg.host if ":" in cfg.host else cfg.host, cfg.port)
    image = {"image/png": {"schema": {"type": "string", "format": "binary"}},
             "image/bmp": {"schema": {"type": "string", "format": "binary"}}}
    secured = [{"ApiKeyAuth": []}, {"BearerAuth": []}]
    return {
        "openapi": "3.0.3",
        "info": {"title": "PixelMath API", "version": __version__,
                 "description": "Text-to-image engine written from scratch (no external model). "
                                "Generate images, inspect how prompts are parsed, and train the engine on your own images."},
        "servers": [{"url": url}],
        "security": secured,
        "paths": {
            "/health": {"get": {"summary": "Liveness check", "operationId": "health", "security": [],
                                "responses": {"200": {"description": "Server is up", "content": {"application/json": {
                                    "schema": {"$ref": "#/components/schemas/Health"}}}}}}},
            "/generate": {
                "post": {"summary": "Generate an image from a prompt", "operationId": "generate",
                         "requestBody": {"required": True, "content": {"application/json": {
                             "schema": {"$ref": "#/components/schemas/GenerateRequest"}}}},
                         "responses": {
                             "200": {"description": "PNG/BMP bytes (response=binary) or JSON with base64 (response=base64). "
                                                    "Headers: X-PixelMath-Mode, X-PixelMath-Seed, X-Render-Seconds",
                                     "content": {**image, "application/json": {
                                         "schema": {"$ref": "#/components/schemas/GenerateJson"}}}},
                             "400": _err("Invalid parameter"), "401": _err("Missing or invalid API key"),
                             "415": _err("Content-Type must be application/json"),
                             "503": _err("Server busy: retry after the Retry-After seconds")}},
                "get": {"summary": "Generate an image (query parameters, handy in a browser)", "operationId": "generateGet",
                        "parameters": [
                            {"name": "prompt", "in": "query", "required": True, "schema": {"type": "string", "maxLength": 2000}},
                            {"name": "size", "in": "query", "schema": {"type": "integer", "default": 512, "minimum": 16, "maximum": 2048}},
                            {"name": "width", "in": "query", "schema": {"type": "integer"}},
                            {"name": "height", "in": "query", "schema": {"type": "integer"}},
                            {"name": "seed", "in": "query", "schema": {"type": "integer", "default": 0}},
                            {"name": "format", "in": "query", "schema": {"type": "string", "enum": ["png", "bmp"], "default": "png"}},
                            {"name": "learned", "in": "query", "schema": {"type": "string", "enum": ["auto", "always", "blend", "off"], "default": "auto"}},
                            {"name": "response", "in": "query", "schema": {"type": "string", "enum": ["binary", "base64"], "default": "binary"}}],
                        "responses": {"200": {"description": "Image bytes", "content": image},
                                      "400": _err("Invalid parameter"), "401": _err("Missing or invalid API key"),
                                      "503": _err("Server busy")}}},
            "/parse": {"post": {"summary": "Show how a prompt is understood", "operationId": "parse",
                                "requestBody": {"required": True, "content": {"application/json": {"schema": {
                                    "type": "object", "required": ["prompt"], "additionalProperties": False,
                                    "properties": {"prompt": {"type": "string"}}}}}},
                                "responses": {"200": {"description": "Parse result", "content": {"application/json": {
                                    "schema": {"$ref": "#/components/schemas/ParseResult"}}}},
                                    "400": _err("Invalid parameter"), "401": _err("Missing or invalid API key")}}},
            "/model": {"get": {"summary": "Info about the loaded trained model", "operationId": "model",
                               "responses": {"200": {"description": "Model info", "content": {"application/json": {
                                   "schema": {"$ref": "#/components/schemas/ModelInfo"}}}},
                                   "401": _err("Missing or invalid API key")}}},
            "/train": {"post": {
                "summary": "Train on an uploaded zip of images + captions (asynchronous)",
                "description": "Zip layout: images (png/jpg/bmp) plus optional captions.csv (file,caption), captions.json "
                               "or a .txt next to each image. Needs the server started with --model PATH. Returns a job to poll.",
                "operationId": "train",
                "requestBody": {"required": True, "content": {
                    "multipart/form-data": {"schema": {"type": "object", "required": ["data"], "properties": {
                        "data": {"type": "string", "format": "binary", "description": "the zip file"},
                        "epochs": {"type": "integer", "default": 80, "minimum": 1, "maximum": 500},
                        "lr": {"type": "number", "default": 0.3}, "l2": {"type": "number", "default": 0.0001},
                        "val_frac": {"type": "number", "default": 0.15}, "seed": {"type": "integer", "default": 0},
                        "fresh": {"type": "boolean", "default": False, "description": "ignore the existing model"},
                        "grid": {"type": "integer", "default": 16, "description": "new models only"},
                        "refit": {"type": "boolean", "default": True}}}},
                    "application/zip": {"schema": {"type": "string", "format": "binary"}}}},
                "responses": {"202": {"description": "Accepted", "content": {"application/json": {
                    "schema": {"$ref": "#/components/schemas/TrainAccepted"}}}},
                    "400": _err("Bad zip or parameter"), "401": _err("Missing or invalid API key"),
                    "403": _err("Training disabled (no --model)"), "409": _err("A training job is already running"),
                    "413": _err("Upload or unzipped data too large"), "415": _err("Unsupported Content-Type")}}},
            "/jobs/{id}": {"get": {"summary": "Training job status", "operationId": "job",
                                   "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}],
                                   "responses": {"200": {"description": "Job", "content": {"application/json": {
                                       "schema": {"$ref": "#/components/schemas/Job"}}}},
                                       "404": _err("Unknown job"), "401": _err("Missing or invalid API key")}}},
            "/jobs": {"get": {"summary": "Recent training jobs", "operationId": "jobs",
                              "responses": {"200": {"description": "Job list"}, "401": _err("Missing or invalid API key")}}},
        },
        "components": {
            "securitySchemes": {"ApiKeyAuth": {"type": "apiKey", "in": "header", "name": "X-API-Key"},
                                "BearerAuth": {"type": "http", "scheme": "bearer"}},
            "schemas": {
                "Error": {"type": "object", "properties": {"error": {"type": "object", "properties": {
                    "code": {"type": "string"}, "message": {"type": "string"}}}}},
                "Health": {"type": "object", "properties": {
                    "status": {"type": "string"}, "version": {"type": "string"}, "model_loaded": {"type": "boolean"},
                    "training_enabled": {"type": "boolean"}, "auth_required": {"type": "boolean"}}},
                "GenerateRequest": {"type": "object", "required": ["prompt"], "additionalProperties": False, "properties": {
                    "prompt": {"type": "string", "maxLength": 2000, "example": "red house with a tree under a sunset sky"},
                    "size": {"type": "integer", "default": 512, "minimum": 16, "maximum": 2048,
                             "description": "square size; the server may cap it lower (default 1024)"},
                    "width": {"type": "integer"}, "height": {"type": "integer"},
                    "seed": {"type": "integer", "default": 0, "description": "same prompt + seed = same image"},
                    "format": {"type": "string", "enum": ["png", "bmp"], "default": "png"},
                    "learned": {"type": "string", "enum": ["auto", "always", "blend", "off"], "default": "auto"},
                    "response": {"type": "string", "enum": ["binary", "base64"], "default": "binary"}}},
                "GenerateJson": {"type": "object", "properties": {
                    "image_base64": {"type": "string"}, "mime": {"type": "string"}, "width": {"type": "integer"},
                    "height": {"type": "integer"}, "seed": {"type": "integer"}, "mode": {"type": "string"},
                    "render_seconds": {"type": "number"}, "known_words": {"type": "array", "items": {"type": "string"}}}},
                "ParseResult": {"type": "object", "properties": {
                    "mode": {"type": "string"}, "time": {"type": "string", "nullable": True},
                    "flags": {"type": "array", "items": {"type": "string"}},
                    "entities": {"type": "array", "items": {"type": "object"}},
                    "not_in_lexicon": {"type": "array", "items": {"type": "string"}},
                    "model_knows": {"type": "array", "items": {"type": "string"}}}},
                "ModelInfo": {"type": "object", "properties": {
                    "loaded": {"type": "boolean"}, "grid": {"type": "integer"}, "samples": {"type": "integer"},
                    "vocabulary": {"type": "integer"}, "top_words": {"type": "array", "items": {"type": "object"}}}},
                "TrainAccepted": {"type": "object", "properties": {
                    "job_id": {"type": "string"}, "status": {"type": "string"}, "status_url": {"type": "string"}}},
                "Job": {"type": "object", "properties": {
                    "id": {"type": "string"},
                    "status": {"type": "string", "enum": ["queued", "extracting", "reading", "training", "done", "error"]},
                    "message": {"type": "string"}, "epoch": {"type": "integer"}, "epochs": {"type": "integer"},
                    "train_rmse": {"type": "number", "nullable": True}, "val_rmse": {"type": "number", "nullable": True},
                    "images_read": {"type": "integer"}, "skipped_count": {"type": "integer"},
                    "skipped": {"type": "array", "items": {"type": "object"}},
                    "metrics": {"type": "object", "nullable": True}, "error": {"type": "object", "nullable": True}}}}}}


def _url(path, query=None):
    raw = "{{baseUrl}}/" + path
    u = {"raw": raw, "host": ["{{baseUrl}}"], "path": [p for p in path.split("/") if p]}
    if query:
        u["query"] = [{"key": k, "value": v} for k, v in query]
        u["raw"] = raw + "?" + "&".join("%s=%s" % (k, v) for k, v in query)
    return u


def _json_body(obj):
    return {"mode": "raw", "raw": json.dumps(obj, indent=2), "options": {"raw": {"language": "json"}}}


def postman_collection():
    def req(name, method, path, body=None, query=None, desc="", events=None):
        r = {"method": method, "header": [], "url": _url(path, query), "description": desc}
        if body is not None:
            r["body"] = body
            if body["mode"] == "raw":
                r["header"].append({"key": "Content-Type", "value": "application/json"})
        item = {"name": name, "request": r}
        if events:
            item["event"] = events
        return item

    save_job = [{"listen": "test", "script": {"type": "text/javascript", "exec": [
        "const j = pm.response.json();",
        "if (j.job_id) { pm.collectionVariables.set('jobId', j.job_id); }"]}}]
    form = lambda: {"mode": "formdata", "formdata": [  # noqa: E731
        {"key": "data", "type": "file", "src": [], "description": "zip of images + captions.csv"},
        {"key": "epochs", "value": "80", "type": "text"},
        {"key": "fresh", "value": "false", "type": "text"}]}
    zip_item = req("Train: raw zip body", "POST", "train", {"mode": "file", "file": {}}, query=[("epochs", "80")],
                   events=save_job, desc="Alternative: body = binary zip, Content-Type application/zip.")
    zip_item["request"]["header"].append({"key": "Content-Type", "value": "application/zip"})
    return {
        "info": {"name": "PixelMath API", "description": "Requests for the PixelMath HTTP API. Set baseUrl (and apiKey if "
                                                          "the server was started with one).",
                 "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
        "auth": {"type": "apikey", "apikey": [{"key": "key", "value": "X-API-Key", "type": "string"},
                                              {"key": "value", "value": "{{apiKey}}", "type": "string"},
                                              {"key": "in", "value": "header", "type": "string"}]},
        "variable": [{"key": "baseUrl", "value": "http://127.0.0.1:8000"}, {"key": "apiKey", "value": ""},
                     {"key": "jobId", "value": ""}],
        "item": [
            req("Health", "GET", "health", desc="Is the server up? No API key needed."),
            req("Generate image (JSON -> PNG)", "POST", "generate", _json_body(
                {"prompt": "red house with a tree under a sunset sky", "size": 512, "seed": 0, "format": "png"}),
                desc="Returns the PNG. Use Send and Download, or the Preview tab."),
            req("Generate image (GET query)", "GET", "generate",
                query=[("prompt", "cyberpunk neo city at night"), ("size", "512")],
                desc="Same as POST but with query parameters; also works in a browser."),
            req("Generate as base64 JSON", "POST", "generate", _json_body(
                {"prompt": "blue ocean with a boat and the sun", "size": 256, "response": "base64"}),
                desc="Returns {image_base64, mime, mode, ...} for apps that want JSON."),
            req("Generate with trained model", "POST", "generate", _json_body(
                {"prompt": "aqua mossy", "size": 256, "learned": "always"}),
                desc="Uses the trained model for words the built-in lexicon does not know."),
            req("Parse prompt", "POST", "parse", _json_body({"prompt": "ek laal ghar aur do ped, raat"}),
                desc="Shows entities, colours, time of day and which words were not understood."),
            req("Model info", "GET", "model"),
            req("Train: upload zip (form-data)", "POST", "train", form(), events=save_job,
                desc="Pick a zip in the 'data' field. Zip = images + captions.csv (file,caption). Needs --model on the server."),
            zip_item,
            req("Training job status", "GET", "jobs/{{jobId}}", desc="Poll until status is done or error."),
            req("Recent jobs", "GET", "jobs"),
        ]}


def main(argv=None):
    out = (argv or sys.argv[1:] or ["api"])[0]
    os.makedirs(out, exist_ok=True)
    for name, obj in (("openapi.json", openapi()), ("postman_collection.json", postman_collection())):
        with open(os.path.join(out, name), "w", encoding="utf-8") as fh:
            json.dump(obj, fh, indent=2, ensure_ascii=False)
            fh.write("\n")
        print("wrote", os.path.join(out, name))


if __name__ == "__main__":
    main()
