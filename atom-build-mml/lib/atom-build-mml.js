'use babel';
/* jshint -W119 */
/* jshint -W104 */

import AtomBuildMmlView from './atom-build-mml-view';
import { CompositeDisposable } from 'atom';
import _ from 'underscore';

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

  build() {
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    } else {
      // this.modalPanel.show();
      var editor = atom.workspace.getActiveTextEditor();
      var files = editor.buffer.file.getParent().getEntriesSync();
      var roll20Files = _.sortBy(_.filter(files, function(item) {
          return item.getBaseName().search(/MML_(?!Test|Roll20).*\.js/) != -1;
      }), "path");
      var roll20String = "";

      _.each(roll20Files, function(file) {
          roll20String += file.readSync(true);
      });
        atom.clipboard.write(roll20String);
    }
  }

};
