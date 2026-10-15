// Every business type the copywriting brain can write for.
import { boldFitness, luxuryMinimal, modernTech, organicNature, playfulVibrant } from './lexiconCore'
import { creativeStudio, education, foodDining, generalBusiness, healthcare, professionalServices } from './lexiconMore'
import { fromKits } from './kits'
import type { Lexicon } from './lexiconTypes'
import type { ThemeKey } from './themes'

export const LEXICONS: Record<ThemeKey, Lexicon> = {
  modern_tech: modernTech,
  luxury_minimal: luxuryMinimal,
  organic_nature: organicNature,
  bold_fitness: boldFitness,
  playful_vibrant: playfulVibrant,
  professional_services: professionalServices,
  healthcare,
  food_dining: foodDining,
  education,
  creative_studio: creativeStudio,
  general_business: generalBusiness,
  ...fromKits((kit) => kit.lexicon),
}
