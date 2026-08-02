import type { Result } from "../shared/result";
import type { SelectionError } from "./selection-validation";
import type { ParsedScreen } from "./types";

export interface SelectedScreenReference {
  readonly id: string;
  readonly name: string;
}

export interface ScreenParser {
  parseSelectedScreen(): Promise<Result<ParsedScreen, SelectionError>>;
  readSelection(): Result<SelectedScreenReference, SelectionError>;
}
