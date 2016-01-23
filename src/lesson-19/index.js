const {div, input, label, h2, makeDOMDriver} = CycleDOM;
const isolate = CycleIsolate;

function intent(DOMSource) {
  return DOMSource.select('.slider').events('input').map(ev => ev.target.value);
}

function model(newValue$, props$) {
  const initialValue$ = props$.map(props => props.init).first();
  const value$ = initialValue$.concat(newValue$);
  return Rx.Observable.combineLatest(value$, props$, (value, props) => {
    return {
      label: props.label,
      unit: props.unit,
      min: props.min,
      max: props.max,
      value: value,
    };
  });
}

function view(state$) {
  return state$.map(state =>
      div('.labeled-slider', [
        label('.label', `${state.label}: ${state.value}${state.unit}`),
        input('.slider', {type: 'range', min: state.min, max: state.max, value: state.value})
      ])
    );
}

function LabeledSlider(sources) {
  const change$ = intent(sources.DOM);
  const state$ = model(change$, sources.props);
  const vtree$ = view(state$);
  return {
    DOM: vtree$
  };
}

const IsolatedLabeledSlider = function (sources) {
  return isolate(LabeledSlider)(sources);
}

function main(sources) {
  const weightProps$ = Rx.Observable.of({
    label: 'Weight',
    unit: 'kg',
    min: 40,
    max: 150,
    init: 70
  });

  const weightSinks = IsolatedLabeledSlider({
    DOM: sources.DOM, props: weightProps$
  });
  const weightVTree$ = weightSinks.DOM;

  const heightProps$ = Rx.Observable.of({
    label: 'Height',
    unit: 'cm',
    min: 140,
    max: 220,
    init: 170
  });

  const heightSinks = IsolatedLabeledSlider({
    DOM: sources.DOM, props: heightProps$
  });
  const heightVTree$ = heightSinks.DOM;

  const vtree$ = Rx.Observable.combineLatest(
    weightVTree$, heightVTree$, (weightVTree, heightVTree) =>
      div([
        weightVTree,
        heightVTree,
      ])
  )

  return {
    DOM: vtree$
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
}

Cycle.run(main, drivers);
