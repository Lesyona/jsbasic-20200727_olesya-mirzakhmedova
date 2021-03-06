export default class StepSlider {
  get elem() {
    return this._sliderElem;
  }
  
  constructor({ steps, value = 0 }) {
    this._steps = steps;
    this._value = value;
    this._isMoving = false;
    this.renderSlider(this._steps, this._value);

    this._thumb.ondragstart = () => false;
    this._thumb.addEventListener('pointerdown', this.sliderDragStart);
    this._sliderElem.addEventListener('click', event => this.sliderClick(event));
  }

  sliderDragStart = () => {
    this._sliderElem.classList.add('slider_dragging');

    this._sliderElem.addEventListener('pointermove', this.sliderDragMove);
  }

  sliderDragMove = (event) => {
    event.preventDefault();
    this._isMoving = true;

    this.changeActiveStep(event);

    let sliderRect = this._sliderElem.getBoundingClientRect();
    let x = event.clientX - sliderRect.left;  // координата клика относительно блока слайдера

    // высчитываем на сколько процентов должен быть закрашен слайдер
    // закрашиваем, смещаем бегунок
    let leftRelative = x / this._sliderWidth;

    if (leftRelative < 0) {
      leftRelative = 0;
    }

    if (leftRelative > 1) {
      leftRelative = 0;
    }

    let shiftPercents = leftRelative * 100;

    this._thumb.style.left = `${shiftPercents}%`;
    this._progress.style.width = `${shiftPercents}%`;

    this._sliderElem.addEventListener('pointerup', this.sliderDragStop);
  }

  sliderDragStop = () => {
    this._sliderElem.classList.remove('slider_dragging');

    this._sliderElem.dispatchEvent(new CustomEvent('slider-change', {
      detail: this._value,
      bubbles: true
    }));

    this._sliderElem.removeEventListener('pointermove', this.sliderDragMove);
    this._sliderElem.removeEventListener('pointerup', this.sliderDragStop);

    setTimeout(() => {
      this._isMoving = false;
    }, 0);
  }

  renderSlider(steps, value) {
    // верстка для слайдера
    this._sliderElem = document.createElement('div');
    this._sliderElem.className = 'slider';

    let sliderHtml = `
      <div class="slider__thumb">
        <span class="slider__value"></span>
      </div>

      <div class="slider__progress"></div>

      <div class="slider__steps"></div>
    `;

    this._sliderElem.innerHTML = sliderHtml;

    // формируем шаги
    let sliderSteps = this._sliderElem.querySelector('.slider__steps');
    for (let i = 0; i < steps; i++) {
      let stepItem = document.createElement('span');

      if(i === value) {
        stepItem.className = 'slider__step-active';
      }
      sliderSteps.append(stepItem);
    }

    // число у бегунка, соответствующее выбранному "сегменту"
    this._sliderValue = this._sliderElem.querySelector('.slider__value');
    this._sliderValue.textContent = this._value;

    // определяем, сколько надо закрасить от шкалы при инициализации слайдера
    let shiftPercents = this._value * 100 / (this._steps - 1);

    this._thumb = this._sliderElem.querySelector('.slider__thumb'); // бегунок
    this._progress = this._sliderElem.querySelector('.slider__progress'); // прогресс-бар

    this._thumb.style.left = `${shiftPercents}%`;
    this._progress.style.width = `${shiftPercents}%`;
  }

  sliderClick(event) {
    if (this._isMoving) return;

    this.changeActiveStep(event);

    // высчитываем на сколько процентов должен быть закрашен слайдер
    // закрашиваем, смещаем бегунок
    let shiftPercents = this._value * this._sliderStepWidth * 100 / this._sliderWidth;

    this._thumb.style.left = `${shiftPercents}%`;
    this._progress.style.width = `${shiftPercents}%`;

    this._sliderElem.dispatchEvent(new CustomEvent('slider-change', {
      detail: this._value,
      bubbles: true
    }));
  }

  changeActiveStep(event) {
    let sliderRect = this._sliderElem.getBoundingClientRect();
    let x = event.clientX - sliderRect.left;  // координата клика относительно блока слайдера

    this._sliderWidth = this._sliderElem.clientWidth; // ширина блока слайдера
    this._sliderStepWidth = this._sliderWidth / (this._steps - 1); // ширина сегмента

    // определяем номер выбранного сегмента, меняем число у бегунка на соответствующее
    this._value = Math.round(x / this._sliderStepWidth);
    this._sliderValue.textContent = this._value;

    // удаляем активный класс у предыдущего шага, делаем активным выбранный
    document.querySelector('.slider__step-active').classList.remove('slider__step-active');
    let spans = document.querySelectorAll('.slider__steps span');
    let spansArray = Array.from(spans);
    spansArray[this._value].classList.add('slider__step-active');
  }
}
