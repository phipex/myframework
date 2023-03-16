import { Observable, Subject } from 'rxjs';

type TriggerType = 'INPUT' | 'OUTPUT';

export abstract class Stage {
  model: Model;
  name: string;
  next?: Stage | null;

  isValid(): boolean;

  getModel(): Model {
    return this.model;
  }
  triggerNext: {
    type: TriggerType;
    fun: Function;
  };
}
export abstract class Model {
  abstract data(): object;
  abstract getStages(): Stage[];
}
type DataChangesTypes = 'ADD' | 'CHANGE';

export interface DataChanges {
  type: DataChangesTypes;
  object: Object;
  propertieName: string | symbol;
  oldValue: any;
  newValue: any;
}
export class ModelContainer {
  public readonly data: object;
  public readonly stages: Stage[];
  public readonly dataChange$: Observable<DataChanges>;
  constructor(model: Model) {
    this.stages = model.getStages();
    const result = ModelContainer.listenerModelChanges(model.getStages());
    this.data = result.proxy;
    this.dataChange$ = result.observable;
    // publicar cambios en los stages
  }

  static listenerModelChanges(targetObj: object): {
    proxy: object;
    observable: Observable<DataChanges>;
  } {
    let subject = new Subject<DataChanges>();
    let proxy = new Proxy(targetObj, {
      get(target: object, prop: keyof typeof targetObj) {
        return target[prop];
      },
      set(target: object, key, val) {
        let oldValue = target[key];
        target[key] = val;
        const change: DataChanges = {
          type: oldValue === undefined ? 'ADD' : 'CHANGE',
          object: target,
          propertieName: key,
          oldValue: oldValue,
          newValue: val,
        };
        subject.next(change);
      },
    }) as typeof targetObj;
    const observable: Observable<DataChanges> = subject.asObservable();
    return { proxy, observable };
  }
}
export abstract class Controller {
  model?: ModelContainer;
  setModel(model: ModelContainer) {
    this.model = model;
  }
}

export abstract class View {
  model?: ModelContainer;
  setModel(model: ModelContainer) {
    this.model = model;
  }
}

export class App {
  actual?: Stage;
  constructor(model: Model, controller: Controller, view: View) {
    if (model.getStages().length < 1) {
      throw Error('No stages confirated');
    } // TODO si no hay se puede configurar una por defecto?
    const modelDto = new ModelContainer(model);
    console.log('modelDto', modelDto);
    controller.setModel(modelDto);
    view.setModel(modelDto);
    this.actual = model.getStages()[0];

    model.getStages().forEach((stage) => {
      // registrar al controller los output
      if (stage.triggerNext.type === 'INPUT') {
        this.registerListenerController(stage);
      }

      // registrar en el vier todos los inpout
      if (stage.triggerNext.type === 'INPUT') {
        this.registerListenerView(stage);
      }
    });
  }
  registerListenerView(stage: Stage) {}
  registerListenerController(stage: Stage) {}
}
