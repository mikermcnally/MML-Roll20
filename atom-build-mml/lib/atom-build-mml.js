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
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'atom-build-mml:toggle': () => this.toggle()
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'atom-build-mml:build': () => this.build()
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

  toggle() {
    console.log('AtomBuildMml was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  build() {
    if (!this.modalPanel.isVisible()){
      this.toggle();
    }
    console.log('Building MML');
    //console.log(getPath());
    // exec("", function(error, stdout, stderr) {
    //
    // });
  }
};
