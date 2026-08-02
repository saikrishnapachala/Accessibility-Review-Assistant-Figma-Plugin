export interface Bounds {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export interface AutoLayoutMetadata {
  readonly counterAxisAlignItems: string | null;
  readonly itemSpacing: number | null;
  readonly layoutMode: "HORIZONTAL" | "NONE" | "VERTICAL";
  readonly paddingBottom: number;
  readonly paddingLeft: number;
  readonly paddingRight: number;
  readonly paddingTop: number;
  readonly primaryAxisAlignItems: string | null;
}

export interface ParsedText {
  readonly characters: string;
  readonly fontSize: number | null;
  readonly fontStyle: string | null;
  readonly fontWeight: number | null;
  readonly lineHeight: number | null;
}

export interface ParsedNode {
  readonly autoLayout: AutoLayoutMetadata | null;
  readonly bounds: Bounds | null;
  readonly children: readonly ParsedNode[];
  readonly componentName: string | null;
  readonly hasImageFill: boolean;
  readonly id: string;
  readonly name: string;
  readonly opacity: number;
  readonly text: ParsedText | null;
  readonly type: string;
  readonly variantProperties: Readonly<Record<string, string>>;
  readonly visible: boolean;
}

export interface ParsedScreen {
  readonly root: ParsedNode;
  readonly sourceNodeId: string;
}
