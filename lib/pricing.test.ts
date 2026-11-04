import { describe, expect, it } from 'vitest'
import { buildPriceBreakdown, computeTotal, VEHICLE_PRICE_TIER } from '@/lib/pricing'
import { VEHICLE_TYPES, type VehicleType } from '@/lib/vehicles'
import type { ServiceType } from '@/lib/types'

// Règle confirmée par le client (2026-11-04). Montants écrits en clair, en cents :
// changer la règle doit faire échouer ces tests, volontairement.
//   service    : extérieur 65 $, intérieur 70 $, complet 99 $
//   majoration : catégorie VUS → intérieur +15 $, complet +20 $, extérieur +0 $
//   céramique  : berline 199 $, VUS 249 $
const EXPECTED: [VehicleType, ServiceType, boolean, number][] = [
  // Catégorie berline
  ['sedan',       'exterior', false,  6500], ['sedan',       'exterior', true, 26400],
  ['sedan',       'interior', false,  7000], ['sedan',       'interior', true, 26900],
  ['sedan',       'complete', false,  9900], ['sedan',       'complete', true, 29800],
  ['suv_compact', 'exterior', false,  6500], ['suv_compact', 'exterior', true, 26400],
  ['suv_compact', 'interior', false,  7000], ['suv_compact', 'interior', true, 26900],
  ['suv_compact', 'complete', false,  9900], ['suv_compact', 'complete', true, 29800],
  ['compact',     'exterior', false,  6500], ['compact',     'exterior', true, 26400],
  ['compact',     'interior', false,  7000], ['compact',     'interior', true, 26900],
  ['compact',     'complete', false,  9900], ['compact',     'complete', true, 29800],
  // Catégorie VUS
  ['suv',         'exterior', false,  6500], ['suv',         'exterior', true, 31400],
  ['suv',         'interior', false,  8500], ['suv',         'interior', true, 33400],
  ['suv',         'complete', false, 11900], ['suv',         'complete', true, 36800],
  ['truck',       'exterior', false,  6500], ['truck',       'exterior', true, 31400],
  ['truck',       'interior', false,  8500], ['truck',       'interior', true, 33400],
  ['truck',       'complete', false, 11900], ['truck',       'complete', true, 36800],
]

describe('catégorie de prix par type de véhicule', () => {
  it('suit exactement la règle du client', () => {
    expect(VEHICLE_PRICE_TIER).toEqual({
      sedan: 'standard', suv_compact: 'standard', compact: 'standard',
      suv: 'suv', truck: 'suv',
    })
  })

  it('couvre chaque type de véhicule existant', () => {
    for (const type of VEHICLE_TYPES) expect(VEHICLE_PRICE_TIER[type]).toBeDefined()
  })

  it('couvre chaque combinaison type × service × céramique', () => {
    expect(EXPECTED).toHaveLength(VEHICLE_TYPES.length * 3 * 2)
  })
})

describe('computeTotal', () => {
  it.each(EXPECTED)('%s, %s, céramique=%s → %i cents', (vehicle, service, ceramique, expected) => {
    expect(computeTotal(service, ceramique ? ['ceramique'] : [], vehicle)).toBe(expected)
  })

  it('les autres suppléments ne dépendent pas du véhicule', () => {
    for (const type of VEHICLE_TYPES) {
      expect(computeTotal('exterior', ['calcium', 'moteur', 'mouche'], type)).toBe(6500 + 2500 + 4000 + 2500)
    }
  })

  it('ignore un supplément inconnu', () => {
    expect(computeTotal('exterior', ['inexistant'], 'sedan')).toBe(6500)
  })

  it('vaut 0 sans service choisi', () => {
    expect(computeTotal(null, ['ceramique'], 'suv')).toBe(0)
  })
})

describe('buildPriceBreakdown', () => {
  it('le total est la somme des lignes, pour toutes les combinaisons', () => {
    for (const [vehicle, service, ceramique] of EXPECTED) {
      const b = buildPriceBreakdown(service, ceramique ? ['ceramique', 'calcium'] : ['calcium'], vehicle)
      expect(b.totalCents).toBe(b.lines.reduce((s, l) => s + l.cents, 0))
    }
  })

  it('pick-up complet + céramique : majoration et céramique au tarif VUS', () => {
    expect(buildPriceBreakdown('complete', ['ceramique'], 'truck').lines).toEqual([
      { kind: 'service',    label: 'Lavage complet',                                       cents: 9900 },
      { kind: 'surcharge',  label: 'Supplément VUS/pick-up',                               cents: 2000 },
      { kind: 'supplement', label: 'Traitement céramique + décontamination (VUS/pick-up)', cents: 24900 },
    ])
  })

  it('VUS compact complet + céramique : aucune majoration, céramique au tarif berline', () => {
    expect(buildPriceBreakdown('complete', ['ceramique'], 'suv_compact').lines).toEqual([
      { kind: 'service',    label: 'Lavage complet',                         cents: 9900 },
      { kind: 'supplement', label: 'Traitement céramique + décontamination', cents: 19900 },
    ])
  })

  it('pas de ligne de majoration à 0 $ (extérieur en catégorie VUS)', () => {
    expect(buildPriceBreakdown('exterior', [], 'truck').lines.map(l => l.kind)).toEqual(['service'])
  })
})
