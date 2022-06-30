export class Update {
  constructor(playload) {
    this.playload = playload;
  }
}

export class UpdateQueue {
  constructor() {
    this.firstUpdate = null;
    this.lastUpdate = null;
  }
  enqueueUpdate(update) {
    if (this.firstUpdate) {
      this.lastUpdate.nextUpdate = update;
      this.lastUpdate = update;
    } else {
      this.firstUpdate = update;
      this.lastUpdate = update;
    }
  }
  forceUpdate(state) {
    let currentUpdate = this.firstUpdate;
    while (currentUpdate) {
      if (currentUpdate) {
        let nextState =
          typeof currentUpdate.playload === "function"
            ? currentUpdate.playload(state)
            : currentUpdate.playload;
        state = { ...state, ...nextState };
      }
      currentUpdate = currentUpdate.nextUpdate;
    }
    this.firstUpdate = this.lastUpdate = null;
    return state;
  }
}
