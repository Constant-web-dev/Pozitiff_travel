/**
 * Модуль управления отображением туров и направлений
 * Использует данные из файла data.js и манипулирует DOM-элементами
 */
'use strict';
import { trips, directions } from "./data.js";

const squareContainer = document.querySelector('.square__tour-container');
const cardsContainer = document.querySelector('.cards__cards-container');
const tripsContainer = document.querySelector('.trips');
const tabContainer = document.querySelector('.trips__tab-container');

const tripImg = document.querySelector('.trip__img');
const tripShadow = document.querySelector('.trip__shadow');

const buttonBox = document.querySelector('.trip__button-box');
const tripButtons = document.querySelectorAll('.trip__button');

const tripContentBox = document.querySelector('.trip__content-box');
const info = document.querySelector('.info');
const routes = document.querySelector('.routes');
const gallery = document.querySelector('.gallery');
const book = document.querySelector('.book');
const bookInfo = document.querySelector('.book-info');

const placesContainer = document.querySelector('.routes__places-container');
const optionsContainer = document.querySelector('.routes__options-container');

const form = document.querySelector('.form');
const submitBtn = document.querySelector('.form__btn');

let name = document.querySelector('#name');
let phone = document.querySelector('#phone');

const carousel = document.getElementById("myCarousel");

/**
 * Форматирует дату в формате ДД.ММ.ГГ
 * @param {Date} date - Дата для форматирования
 * @returns {string} Отформатированная дата или пустая строка
 */
function formatDate (date) {
    if (!date) return '';
    let formatter = {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    };
    return Intl.DateTimeFormat('ru-RU', formatter).format(date);
}

/**
 * Класс для управления отображением туров и направлений
 */
class Direction {
     /**
     * @private {Object[]} Список туров текущего направления
     */
    _trips;

    /**
     * @private {Object} Текущий выбранный тур
     */
    _currentTrip;

    /**
     * @private {number} Индекс текущего слайда галереи
     */
    _currentSlide;

    /**
     * Инициализация компонента
     * Рендерит начальные элементы и устанавливает обработчики событий
     */
    constructor() {
        this._renderUpcoming();
        this._renderDirections();
        this._renderTabs();
        this._initEventListeners();
    }

    /**
     * Устанавливает обработчики событий для всех элементов
     */
    _initEventListeners () {
        squareContainer.addEventListener('click', this._upcomingHandler.bind(this));
        cardsContainer.addEventListener('click', this._cardButtonHandler.bind(this));
        tabContainer.addEventListener('click', this._tabsHandler.bind(this));
        buttonBox.addEventListener('click', this._buttonHandler.bind(this));
        form.addEventListener('submit', this._sendEmail.bind(this));
    }

    /**
     * Очищает и вставляет HTML-содержимое в контейнер
     * @param {HTMLElement} container - Целевой контейнер
     * @param {string} htmlContent - HTML-код для вставки
     */
    _renderElement (container, htmlContent) {
        container.textContent = '';
        container.insertAdjacentHTML('beforeend', htmlContent);
    }

    /**
     * Обработчик клика по предстоящим турам
     * @param {Event} e - Событие клика
     */
    _upcomingHandler (e) {
        let target = e.target.closest('.square__tour');
        if (!target) return
        let directionName = target.dataset.direction;
        let tripId = target.dataset.id;
        let direction = directions.find(direction => direction.name == directionName);
        this._getTrips(direction);
        this._renderTabs(tripId);
        tripsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * Генерирует HTML из массива элементов
     * @param {Array} items - Массив элементов
     * @param {Function} templateFn - Функция-шаблон
     * @returns {string} Сгенерированный HTML
     */
    _generateHTML (items, templateFn) {
        return items.map(templateFn).join('');
    }

    /**
     * Рендерит предстоящие туры
     */
    _renderUpcoming () {
        const upcoming = trips
            .filter(trip => (trip.date > new Date()) && trip.price)
            .sort((a, b) => a.date - b.date)
            .slice(0, 3);

        const templateFn = (trip) => `
            <a class="tour square__tour" href="javascript:void(0)" data-direction="${trip.direction}" data-id="${trip.id}">
                <p class="paragraph_max tour__seats">${this._getSeatStatus(trip.seats)}</p>

                <svg class="tour__icon">
                    <use xlink:href="icons/sprites/symbol-defs.svg#icon-date"></use>
                </svg>

                <p class="paragraph_max">${formatDate(trip.date)}</p>

                <svg class="tour__icon">
                    <use xlink:href="icons/sprites/symbol-defs.svg#icon-location"></use>
                </svg>

                <p class="paragraph_max">${trip.direction}</p>

                <svg class="tour__icon">
                    <use xlink:href="icons/sprites/symbol-defs.svg#icon-routes"></use>
                </svg>

                <p class="paragraph_max">${trip.name}</p>

                <svg class="tour__icon">
                    <use xlink:href="icons/sprites/symbol-defs.svg#icon-price"></use>
                </svg>

                <p class="paragraph_max">${trip.price}₽</p>

            </a>
        `;

        const upcomingHtml = this._generateHTML(upcoming, templateFn);
        this._renderElement(squareContainer, upcomingHtml);
    }

    /**
     * Обработчик клика по кнопке карточки направления
     * @param {Event} e - Событие клика
     */
    _cardButtonHandler (e) {
        if (e.target.classList.contains('card__btn')) {
            let id = e.target.dataset.id;
            let direction = directions.find((direction) => direction.id == id);
            this._getTrips(direction);
            this._renderTabs();
            tripsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Получает туры по выбранному направлению
     * @param {Object} direction - Объект направления
     */
    _getTrips (direction) {
        this._trips = trips.filter((trip) => direction.trips.includes(trip.id));
        this._trips.sort((a, b) => (a.date != null ? a.date : Infinity) - (b.date != null ? b.date : Infinity));
    }

    /**
     * Возвращает ближайшую дату тура по направлению
     * @param {Object} direction - Объект направления
     * @returns {string} Отформатированная дата или дефис
     */
    _nearestDate (direction) {
        this._getTrips(direction);
        let date = this._trips[0].date;
        return date ? formatDate(date) : '-';
    }

    /**
     * Рендерит карточки направлений
     */
    _renderDirections () {
        let noEmptyDirections = directions.filter((direction) => (direction.trips.length != 0));

        const templateFn = (direction) => `
            <div class="card" onclick="">
                <img class="card__img" src="img/directions/${direction.id}.jpg" alt="${direction.name}">
                <div class="card__overlay"></div>

                <h3 class="title-third card__title">${direction.name}</h3>

                <div class="card__content-box card__content-box_1">
                    <svg class="card__icon">
                        <use xlink:href="icons/sprites/symbol-defs.svg#icon-routes"></use>
                    </svg>
                    <p class="paragraph paragraph_white card__paragraph">варианты<br>маршрута:</p>
                    <p class="paragraph paragraph_white card__paragraph">${direction.trips.length}</p>
                </div>

                <div class="card__content-box card__content-box_2">
                    <svg class="card__icon">
                        <use xlink:href="icons/sprites/symbol-defs.svg#icon-date"></use>
                    </svg>
                    <p class="paragraph paragraph_white card__paragraph">ближайшая<br>дата:</p>
                    <p class="paragraph paragraph_white card__paragraph">${this._nearestDate(direction)}</p>
                </div>
                
                <a class ="btn-2 card__btn" data-id="${direction.id}" href="javascript:void(0)">подробнее →</a>
                
                <div class="card__box"></div>
            </div>
        `;

        const directionsHtml = this._generateHTML(noEmptyDirections, templateFn);
        this._renderElement(cardsContainer, directionsHtml);
        this._getTrips(noEmptyDirections[0]);
    }

    /**
     * Определяет правильное склонение числительных
     * @param {number} num - Число для проверки
     * @returns {boolean|number} Результат проверки -1, 0, 1
     */
    _plural (num) {
        if (num % 10 === 1 && num !== 11) return -1;
        return [2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100);
    }

    /**
     * Обработчик клика по вкладке списка туров
     * @param {Event} e - Событие клика
     */
    _tabsHandler (e) {
        let id = e.target.dataset.tab;
        this._renderTabs(id);
        tripsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * Обработчик клика по кнопкам контента тура
     * @param {Event} e - Событие клика
     */
    _buttonHandler (e = null) {
        let btn = e ? e.target.closest('.trip__button') : tripButtons[0];
        if (!btn) return;
        tripButtons.forEach((btn) => btn.classList.remove('trip__button-active'));
        btn.classList.add('trip__button-active');

        // Логика переключения вкладок
        switch (btn.dataset.type) {
            case 'routes':
                this._showRoutes();
                break;
            case 'images':
                this._showGallery();
                break;
            case 'book':
                this._showBook();
                break;
            default:
                this._showInfo();
                break;
        }
    }

    /**
     * Рендерит список туров
     * @param {string} id - ID текущего тура
     */
    _renderTabs (id = null) {
        id = id ? id : this._trips[0]?.id;
        this._currentTrip = this._trips.find((t) => t.id == id);

        // Генерация HTML списка туров
        const templateFn = (trip) => `
            <button class="tab ${trip == this._currentTrip ? 'tab-active' : ''}" data-tab="${trip.id}">
                ${trip.name}
            </button>
        `;

        const tabsHtml = this._generateHTML(this._trips, templateFn);
        this._renderElement(tabContainer, tabsHtml);
        this._buttonHandler();
    }

    /**
     * Переключает видимость контейнеров контента
     * @param {HTMLElement} activeContainer - Активный контейнер
     */
    _showContentContainer (activeContainer) {
        tripContentBox.childNodes.forEach(function (container) {
            if (!container.classList.contains('hidden')) {
                container.classList.add('hidden');
            }
        });
        activeContainer.classList.remove('hidden');
    }

    /**
     * Возвращает статус наличия мест
     * @param {number} number - Количество мест
     * @returns {string} Статус мест
     */
    _getSeatStatus (number) {
        if (!number) return 'Мест нет';
        return `${number} ${['мест', 'места', 'место'].at(this._plural(number))}`;
    }

    /**
     * Отображает информацию о текущем туре
     */
    _showInfo () {
        this._showContentContainer(info);
        tripImg.src = `img/trips/${this._currentTrip.id}/main.jpg`;
        tripShadow.classList.add('trip__shadow_min');
        let hiddenClass = this._currentTrip.price ? '' : 'hidden';

        // Рендер информации о туре
        const infoHtml = `
            <div class="info__figure ${hiddenClass}">
                <p class="info__seats">${this._getSeatStatus(this._currentTrip.seats)}</p>
            </div>
            <h2 class="title-second info__title">
                ${this._currentTrip.name}
            </h2>
            <p class="info__duration">${this._currentTrip.duration} ${['дней', 'дня', 'день'].at(this._plural(this._currentTrip.duration))}</p>
            <p class="info__date">${formatDate(this._currentTrip.date)}</p>
            <div class="info__label ${hiddenClass}">
                <img src="img/price.svg" alt="">
                <p class="info__price">${this._currentTrip.price}₽</p>
            </div>
        `;

        this._renderElement(info, infoHtml);
    }

    /**
     * Отображает маршруты текущего тура
     */
    _showRoutes () {
        this._showContentContainer(routes);
        tripShadow.classList.remove('trip__shadow_min');

        // Рендер информации о маршруте и доп. расходах
        const placesTemplateFn = (place) => `
            <div class="routes__place">
                <svg class="routes__icon">
                    <use xlink:href="icons/sprites/symbol-defs.svg#icon-location"></use>
                </svg>

                <p class="paragraph paragraph_max paragraph_white">${place}</p>
            </div>
        `;

        const optionalTemplateFn = (option) => `
            <div class="routes__option">
                <svg class="routes__icon">
                    <use xlink:href="icons/sprites/symbol-defs.svg#icon-coins"></use>
                </svg>
                <p class="paragraph paragraph_max paragraph_white">${option}</p>
            </div>
        `;

        const placesHtml = this._generateHTML(this._currentTrip.places, placesTemplateFn);
        const optionalHtml = this._generateHTML(this._currentTrip.optional, optionalTemplateFn);

        this._renderElement(placesContainer, placesHtml);
        this._renderElement(optionsContainer, optionalHtml);
    }

    /**
     * Отображает галерею текущего тура
     */
    _showGallery () {
        this._showContentContainer(gallery);
        tripShadow.classList.remove('trip__shadow_min');
        this._currentSlide = 0;
        this._maxSlide = this._currentTrip.slides || 0;

        // Инициализация карусели и галереи
        const galleryHtml = Array.from({ length: this._maxSlide }, (_, i) => ` 
            <div
                class="f-carousel__slide"
                data-fancybox="gallery"
                data-src="img/trips/${this._currentTrip.id}/${i + 1}.jpg"
                data-thumb-src="img/trips/${this._currentTrip.id}/${i + 1}.jpg"
                >
                <img
                    data-lazy-src="img/trips/${this._currentTrip.id}/${i + 1}.jpg"
                    alt="Image #${i + 1}"
                    />
            </div>
        `).join('');

        this._renderElement(carousel, galleryHtml);

        if (this._carouselInstance) {
            this._carouselInstance.destroy();
            window.Fancybox.close();
        }

        this._initCarousel();
    }

    /**
     * Инициализирует карусель изображений
     */
    _initCarousel () {

        this._carouselInstance = window.Carousel(document.getElementById("myCarousel"), {}, {
            Lazyload,
            Arrows,
            Thumbs
        });
        this._carouselInstance.init();

        window.Fancybox.bind("[data-fancybox]", {
            Carousel: {
                Thumbs: false,
                Toolbar: {
                    display: {
                        left: ["counter"],
                        middle: [],
                        right: ["autoplay", "fullscreen", "close"],
                    },
                },
            }
        });
    }

    /**
     * Отображает форму бронирования
     */
    _showBook () {
        this._showContentContainer(book);
        tripShadow.classList.remove('trip__shadow_min');
    }

    /**
     * Обработчик отправки формы бронирования
     * @param {Event} e - Событие отправки формы
     */
    _sendEmail (e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.classList.add('progress-cursor');
        document.body.classList.add('progress-cursor');
        this._currentTrip.booked = this._currentTrip.booked || new Set();
        let { booked, name: tripName } = this._currentTrip;

        if (booked.has(phone.value.slice(-10))) {
            this._bookSuccess();
            this._resetForm();
            return;
        }

        emailjs.send(
            "service_p29vw4l",
            "template_u8wi31a",
            { name: name.value, phone: phone.value, trip: tripName }
        )
            .then(() => {
                this._bookSuccess();
                this._currentTrip.booked.add(phone.value.slice(-10));
            }, (error) => {
                this._bookError();
                console.log('FAILED...', error);
            })
            .finally(() => {
                this._resetForm();
            });
    }

    /**
     * Сбрасывает состояние формы
     */
    _resetForm () {
        submitBtn.disabled = false;
        document.body.classList.remove('progress-cursor');
        submitBtn.classList.remove('progress-cursor');
        // Сброс полей формы
        name.value = '';
        phone.value = '';
    }

    /**
     * Отображает контейнер после отправки формы 
     */
    _showBookInfo () {
        this._showContentContainer(bookInfo);
        tripShadow.classList.remove('trip__shadow_min');
    }

    /**
     * Отображает информацию об успешной бронировании
     */
    _bookSuccess () {
        this._showBookInfo();

        // Сообщение об успехе
        const bookHtml = `
            <svg class="book-info__icon">
                <use xlink:href="icons/sprites/symbol-defs.svg#icon-check"></use>
            </svg>

            <p class="paragraph paragraph_max paragraph_white book-info__succes">
                Спасибо 
                ${name.value[0].toUpperCase() + name.value.slice(1)}, 
                ваша заявка принята, 
                в ближайшее время с Вами свяжется 
                организатор по уканному вами 
                номеру телефона.
            </p>
        `;

        this._renderElement(bookInfo, bookHtml);
    }

    /**
     * Отображает информацию об ошибке бронирования
     */
    _bookError () {
        this._showBookInfo();

        // Сообщение об ошибке
        const bookHtml = `
            <svg class="book-info__icon">
                <use xlink:href="icons/sprites/symbol-defs.svg#icon-error"></use>
            </svg>
            <h2 class="title-second title-second_white">Не удалось завершить бронирование</h2>
            
            <div class="book-info__content">
                <p class="paragraph paragraph_max paragraph_white book-info__paragraph">
                    Причина: проблемы с интернет-соединением. 
                </p>
                
                <p class="paragraph paragraph_max paragraph_white">
                    Попробуйте:
                </p> 
                
                <ul class="book-info__list">
                    <li class="book-info__list">
                        <p class="paragraph paragraph_max paragraph_white">Обновите страницу</p>
                    </li>

                    <li class="book-info__list">
                        <p class="paragraph paragraph_max paragraph_white">Проверьте подключение к интернету</p>
                    </li>

                    <li class="book-info__list">
                        <p class="paragraph paragraph_max paragraph_white">Повторите попытку позже</p>
                    </li>
                </ul>
            </div>
        `;

        this._renderElement(bookInfo, bookHtml);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    new Direction();
})


