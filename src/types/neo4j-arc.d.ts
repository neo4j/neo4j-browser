declare module 'neo4j-arc/common' {
  export function deepEquals(a: any, b: any): boolean;
  export function mapObjectValues(obj: any): any;
  export function isMac(): boolean;
  export function extractUniqueNodesAndRels(nodes: any[], rels: any[]): any;
  export function getPropertyTypeDisplayName(type: string): string;
  export function cypherDataToString(data: any): string;
  export function propertyToString(property: any): string;
  export function numberToUSLocale(num: number): string;
  export function toKeyString(str: string): string;
  export function upperFirst(str: string): string;

  export interface BasicNode {
    id: string;
    labels: string[];
    properties: Record<string, any>;
  }

  export interface BasicRelationship {
    id: string;
    type: string;
    properties: Record<string, any>;
    startNodeId: string;
    endNodeId: string;
  }

  export interface BasicNodesAndRels {
    nodes: BasicNode[];
    relationships: BasicRelationship[];
  }

  export interface VizItemProperty {
    key: string;
    value: any;
    type: string;
  }

  export type CypherBasicPropertyType = any;
  export type CypherDataType = any;
  export type CypherList = any[];
  export type CypherMap = Record<string, any>;
  export type CypherProperty = any;
  export type CypherStructuralType = any;

  export function isCypherTemporalType(type: string): boolean;
  export function isCypherBasicPropertyType(type: string): boolean;
  export function isCypherPropertyType(type: string): boolean;

  export const ClickableUrls: React.FC<any>;
  export const ClipboardCopier: React.FC<any>;
  export function copyToClipboard(text: string): void;
  export const StyledLabelChip: React.FC<any>;
  export const StyledPropertyChip: React.FC<any>;
  export const StyledRelationshipChip: React.FC<any>;
  export const ShowMoreOrAll: React.FC<any>;
  export const PropertiesTable: React.FC<any>;
  export const WarningMessage: React.FC<any>;

  export const ArcThemeProvider: React.FC<any>;
  export const baseArcTheme: any;
}

declare module 'neo4j-arc/cypher-language-support' {
  export interface CypherEditor {
    getValue(): string
  }

  export interface CypherEditorProps {
    enableMultiStatementMode: boolean
    fontLigatures: boolean
    history: string[]
    id: string
    isFullscreen: boolean
    onChange: () => void
    onDisplayHelpKeys: () => void
    onExecute: () => void
    ref: React.RefObject<CypherEditor>
    additionalCommands: Record<string, any>
    useDb: string | null
    sendCypherQuery: (text: string) => Promise<any>
  }
  
  export const CypherEditor: React.FC<CypherEditorProps> & { prototype: CypherEditor }
}

declare module 'neo4j-arc/graph-visualization' {
  export interface GraphModel {
    nodes(): any[]
  }
  
  export interface GraphVisualizerProps {
    maxNeighbours: number
    hasTruncatedFields: boolean
    graphStyleData: any
    updateStyle: (style: any) => void
    getNeighbours: (id: string, currentNeighbourIds?: string[]) => Promise<any>
    nodes: any[]
    relationships: any[]
    isFullscreen: boolean
    assignVisElement: (v: any) => void
    nodeLimitHit: boolean
    getAutoCompleteCallback: (callback: any) => void
    setGraph: (graph: GraphModel) => void
    setNodePropertiesExpandedByDefault: (expanded: boolean) => void
    nodePropertiesExpandedByDefault: boolean
    wheelZoomRequiresModKey: boolean
    wheelZoomInfoMessageEnabled: boolean
    disableWheelZoomInfoMessage: () => void
    DetailsPaneOverride: React.ComponentType<any>
    OverviewPaneOverride: React.ComponentType<any>
    useGeneratedDefaultColors: boolean
    initialZoomToFit?: boolean
    autocompleteRelationships?: boolean
  }

  export const GraphVisualizer: React.FC<GraphVisualizerProps>
} 