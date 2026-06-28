export enum MinecraftEdition {
  JAVA = 'java',
  BEDROCK = 'bedrock',
}

export interface VersionInfo {
  id: string;
  mcVersion: number; // Cubiomes MCVersion constant
  label: string;
  features: {
    buriedTreasure: boolean;
    shipwreck: boolean;
    phantom: boolean;
    pillagerOutpost: boolean;
    bambooJungle: boolean;
    bastion: boolean;
    netherOverhaul: boolean;
    deepDark: boolean;
    ancientCity: boolean;
    mangroveSwamp: boolean;
    cherryGrove: boolean;
    trailRuins: boolean;
    sniffer: boolean;
    trialChamber: boolean;
    copperBulb: boolean;
  };
}

export const JAVA_VERSIONS: VersionInfo[] = [
  { id: '1.0', mcVersion: 10, label: '1.0', features: { buriedTreasure: false, shipwreck: false, phantom: false, pillagerOutpost: false, bambooJungle: false, bastion: false, netherOverhaul: false, deepDark: false, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.12', mcVersion: 112, label: '1.12', features: { buriedTreasure: false, shipwreck: false, phantom: false, pillagerOutpost: false, bambooJungle: false, bastion: false, netherOverhaul: false, deepDark: false, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.13', mcVersion: 113, label: '1.13', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: false, bambooJungle: false, bastion: false, netherOverhaul: false, deepDark: false, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.14', mcVersion: 114, label: '1.14', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: false, netherOverhaul: false, deepDark: false, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.16', mcVersion: 116, label: '1.16', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: false, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.18', mcVersion: 118, label: '1.18', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: true, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.19', mcVersion: 119, label: '1.19', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: true, ancientCity: true, mangroveSwamp: true, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.20', mcVersion: 120, label: '1.20', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: true, ancientCity: true, mangroveSwamp: true, cherryGrove: true, trailRuins: true, sniffer: true, trialChamber: false, copperBulb: false } },
  { id: '1.21', mcVersion: 121, label: '1.21', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: true, ancientCity: true, mangroveSwamp: true, cherryGrove: true, trailRuins: true, sniffer: true, trialChamber: true, copperBulb: true } },
];

export const BEDROCK_VERSIONS: VersionInfo[] = [
  { id: '1.16', mcVersion: 116, label: '1.16', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: false, ancientCity: false, mangroveSwamp: false, cherryGrove: false, trailRuins: false, sniffer: false, trialChamber: false, copperBulb: false } },
  { id: '1.21', mcVersion: 121, label: '1.21', features: { buriedTreasure: true, shipwreck: true, phantom: true, pillagerOutpost: true, bambooJungle: true, bastion: true, netherOverhaul: true, deepDark: true, ancientCity: true, mangroveSwamp: true, cherryGrove: true, trailRuins: true, sniffer: true, trialChamber: true, copperBulb: true } },
];
