import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter';
import { App, Controller, DataChanges, Model, Stage, View } from './stages';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

class ModelJuego extends Model {
  constructor() {
    super();
  }
  data(): object {
    return {
      uno: 1,
      dos: 2,
      tres: 3,
    };
  }
  getStages() {
    const primer: Stage = {
      name: 'getConfig',
      next: null,
      isValid() {
        return true;
      },
      setModel(model: Model) {
        this.model = model;
      },
      getModel() {
        return this.model;
      },
      triggerNext: {
        type: 'OUTPUT',
        fun: () => {},
      },
    };
    const initial: Stage = {
      name: 'initial',
      next: primer,
      isValid() {
        return true;
      },
      setModel(model: Model) {
        this.model = model;
      },
      getModel() {
        return this.model;
      },
      triggerNext: {
        type: 'OUTPUT',
        fun: () => {},
      },
    };
    return [initial, primer];
  }
}
class ControllerJuego extends Controller {
  constructor() {
    super();
  }
}

class ViewJuego extends View {
  constructor() {
    super();
  }
  registrarObservable() {
    console.log('this', this);

    this.model.dataChange$.subscribe({
      next: (dataChange: DataChanges) => console.log(dataChange),
    });
    this.model.data.uno = 2;
  }
}

const model = new ModelJuego();
console.log('model', model);

const controller = new ControllerJuego();
const view = new ViewJuego();
const app = new App(model, controller, view);
console.log('controller', controller);
console.log('app', app);
console.log('view', view);
console.log('model', model);
view.registrarObservable();
