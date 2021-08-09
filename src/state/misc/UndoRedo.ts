import { Option } from '../../tools';

export class UndoRedo<St> {
  static readonly MAX_UNDOS = 16;
  private undoStack: St[];
  private redoStack: St[];

  constructor(private emptyState: St) {
    this.undoStack = [emptyState];
    this.redoStack = [];
  }

  commit(state: St): UndoRedo<St> {
    const clone = new UndoRedo<St>(this.emptyState);
    clone.undoStack = [
      state,
      ...this.undoStack.slice(0, UndoRedo.MAX_UNDOS - 1),
    ];
    clone.redoStack = [];
    return clone;
  }

  undo(): Option<[St, UndoRedo<St>]> {
    if (this.undoStack.length < 2) {
      return Option.None();
    }

    const clone = new UndoRedo<St>(this.emptyState);
    const [currentState, previousState, ...undoStack] = this.undoStack;
    clone.undoStack = [previousState, ...undoStack];
    clone.redoStack = [currentState, ...this.redoStack];
    return Option.Some([previousState, clone]);
  }

  redo(): Option<[St, UndoRedo<St>]> {
    if (this.redoStack.length < 1) {
      return Option.None();
    }

    const clone = new UndoRedo<St>(this.emptyState);
    const [mostRecentState, ...redoStack] = this.redoStack;
    clone.redoStack = redoStack;
    clone.undoStack = [mostRecentState, ...this.undoStack];
    return Option.Some([mostRecentState, clone]);
  }
}
