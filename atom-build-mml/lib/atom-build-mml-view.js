'use babel';

export default class AtomBuildMmlView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-build-mml');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The AtomBuildMml package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  setOutput(output) {
    this.element.children[0].textContent = output;
  }
}
