'use babel';

import AtomBuildMmlView from './atom-build-mml-view';
import { CompositeDisposable } from 'atom';
var exec = require('child_process').exec;

export default {

  atomBuildMmlView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomBuildMmlView = new AtomBuildMmlView(state.atomBuildMmlViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomBuildMmlView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-build-mml:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomBuildMmlView.destroy();
  },

  serialize() {
    return {
      atomBuildMmlViewState: this.atomBuildMmlView.serialize()
    };
  },

  build() {
    console.log('AtomBuildMml was built!');
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    } else {
      this.apply(exec, ["Compile_MML.bat", function(error, stdout, stderr) {
        this.atomBuildMmlView.setOutput(stdout);
        this.modalPanel.show();
      }]);
    }
  }

};
