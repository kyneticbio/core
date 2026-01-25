import type { ConditionDef } from "../types";

/**
 * COMT (Catechol-O-methyltransferase)
 * 
 * COMT is an enzyme that breaks down catecholamines like dopamine, epinephrine, and norepinephrine.
 * The Val158Met polymorphism (rs4680) significantly affects its activity level, 
 * particularly in the prefrontal cortex where COMT is the primary dopamine clearing mechanism.
 */
export const comt: ConditionDef = {
  key: 'comt',
  category: 'genetic',
  label: 'COMT (Val158Met)',
  description: {
    physiology:
      'COMT is the primary enzyme responsible for degrading dopamine in the prefrontal cortex. ' +
      'The Val158Met variant determines enzyme stability and activity rate.',
    application:
      'Select your genotype (rs4680) to model baseline PFC dopamine levels and stimulant sensitivity.',
    references: [
      'Chen et al. (2004)',
      'Tunbridge et al. (2006)',
    ],
  },
  params: [
    {
      key: 'genotype',
      label: 'Genotype (rs4680)',
      type: 'select',
      options: [
        {
          label: 'Val/Val (Fast)',
          value: 0.4,  // +40% COMT activity relative to baseline
          description: 'High activity COMT. Lower tonic dopamine in PFC. "Warrior" profile.',
          rsid: 'rs4680(G;G)'
        },
        {
          label: 'Val/Met (Intermediate)',
          value: 0.0,  // Baseline COMT activity
          description: 'Balanced activity.',
          rsid: 'rs4680(A;G)'
        },
        {
          label: 'Met/Met (Slow)',
          value: -0.4,  // -40% COMT activity relative to baseline
          description: 'Low activity COMT. Higher tonic dopamine in PFC. "Worrier" profile.',
          rsid: 'rs4680(A;A)'
        }
      ],
      default: 0.0,
    },
  ],
  enzymeModifiers: [
    { 
      enzyme: 'COMT', 
      paramKey: 'genotype', 
      activity: 1.0 // Directly scales based on the option value
    },
  ],
  signalModifiers: [
    { 
      key: 'dopamine', 
      paramKey: 'genotype', 
      // Note: Low activity (Met/Met) = higher dopamine, hence inverse relationship with 'value'
      // This is handled by the engine applying the enzyme activity change which then affects the signal.
      // But we can also add fine-grained baseline adjustments if needed.
    }
  ],
};
