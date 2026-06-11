import '../pages/index.css';
import logo from '../images/logo.svg';
import { createCard, updateLikeUI, removeCardElement } from './components/card.js';
import {
  openPopup,
  closePopup,
  setPopupEventListeners,
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import {
  fetchUserData,
  fetchCardList,
  updateUserProfile,
  updateUserAvatar,
  createNewCard,
  removeExistingCard,
  toggleCardLike,
} from './components/api.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');
const profileEditButton = document.querySelector('.profile__edit-button');
const profileAddButton = document.querySelector('.profile__add-button');
const placesList = document.querySelector('.places__list');

const profilePopup = document.querySelector('.popup_type_edit');
const profileForm = document.forms['edit-profile'];
const profileNameInput = profileForm.elements['name'];
const profileDescriptionInput = profileForm.elements['description'];
const profileSubmitButton = profileForm.querySelector('.popup__button');

const cardPopup = document.querySelector('.popup_type_new-card');
const cardForm = document.forms['new-place'];
const cardNameInput = cardForm.elements['place-name'];
const cardLinkInput = cardForm.elements['link'];
const cardSubmitButton = cardForm.querySelector('.popup__button');

const avatarPopup = document.querySelector('.popup_type_edit-avatar');
const avatarForm = document.forms['edit-avatar'];
const avatarInput = avatarForm.elements['avatar'];
const avatarSubmitButton = avatarForm.querySelector('.popup__button');

const imagePopup = document.querySelector('.popup_type_image');
const imagePopupPicture = imagePopup.querySelector('.popup__image');
const imagePopupCaption = imagePopup.querySelector('.popup__caption');

const removeCardPopup = document.querySelector('.popup_type_remove-card');
const removeCardForm = document.forms['remove-card'];
const removeCardSubmitButton = removeCardForm.querySelector('.popup__button');

const cardInfoPopup = document.querySelector('.popup_type_info');
const cardInfoList = cardInfoPopup.querySelector('.popup-info__list');
const cardInfoUsersList = cardInfoPopup.querySelector('.popup-info__users');

const infoDefinitionTemplate = document.querySelector('#popup-info-definition-template').content;
const userPreviewTemplate = document.querySelector('#popup-info-user-preview-template').content;

const popups = document.querySelectorAll('.popup');

const logoImg = document.querySelector('.header__logo');
logoImg && (logoImg.src = logo);

let currentUserId = '';
let cardToDeleteId = null;
let cardToDeleteElement = null;

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function createInfoString(term, description) {
  const definitionElement = infoDefinitionTemplate
    .querySelector('.popup-info__definition')
    .cloneNode(true);
  definitionElement.querySelector('.popup-info__term').textContent = term;
  definitionElement.querySelector('.popup-info__description').textContent = description;
  return definitionElement;
}

function renderUserInfo(userData) {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileImage.style.backgroundImage = `url('${userData.avatar}')`;
}

function handleImageClick(name, link) {
  imagePopupPicture.src = link;
  imagePopupPicture.alt = name;
  imagePopupCaption.textContent = name;
  openPopup(imagePopup);
}

function handleLikeClick(cardId, likeButton, likeCount) {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  toggleCardLike(cardId, isLiked)
    .then((updatedCard) => {
      updateLikeUI(likeButton, likeCount, updatedCard);
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleDeleteClick(cardId, cardElement) {
  cardToDeleteId = cardId;
  cardToDeleteElement = cardElement;
  openPopup(removeCardPopup);
}

function handleInfoClick(cardId) {
  fetchCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) {
        return;
      }

      while (cardInfoList.firstChild) {
        cardInfoList.removeChild(cardInfoList.firstChild);
      }
      while (cardInfoUsersList.firstChild) {
        cardInfoUsersList.removeChild(cardInfoUsersList.firstChild);
      }

      function addInfoField(termText, descriptionText) {
        const definition = document.createElement('div');
        definition.className = 'popup-info__definition';
        
        const term = document.createElement('dt');
        term.className = 'popup-info__term';
        const termSpan = document.createElement('span');
        termSpan.textContent = termText;
        term.appendChild(termSpan);
        
        const description = document.createElement('dd');
        description.className = 'popup-info__description';
        const descSpan = document.createElement('span');
        descSpan.textContent = descriptionText;
        description.appendChild(descSpan);
        
        definition.appendChild(term);
        definition.appendChild(description);
        cardInfoList.appendChild(definition);
      }

      addInfoField('Описание:', cardData.name);
      addInfoField('Дата создания:', formatDate(new Date(cardData.createdAt)));
      addInfoField('Владелец:', cardData.owner.name);
      addInfoField('Количество лайков:', String(cardData.likes.length));

      cardData.likes.forEach((user) => {
        const userItem = document.createElement('li');
        userItem.className = 'popup-info__user';
        const userNameSpan = document.createElement('span');
        userNameSpan.className = 'popup-info__user-name';
        userNameSpan.textContent = user.name;
        userItem.appendChild(userNameSpan);
        cardInfoUsersList.appendChild(userItem);
      });

      openPopup(cardInfoPopup);
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  profileSubmitButton.textContent = 'Сохранение...';

  updateUserProfile(profileNameInput.value, profileDescriptionInput.value)
    .then((userData) => {
      renderUserInfo(userData);
      closePopup(profilePopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      profileSubmitButton.textContent = 'Сохранить';
    });
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  cardSubmitButton.textContent = 'Создание...';

  createNewCard(cardNameInput.value, cardLinkInput.value)
    .then((newCard) => {
      const cardElement = createCard(
        newCard,
        currentUserId,
        handleDeleteClick,
        handleLikeClick,
        handleImageClick,
        handleInfoClick
      );
      placesList.prepend(cardElement);
      cardForm.reset();
      clearValidation(cardForm, validationConfig);
      closePopup(cardPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      cardSubmitButton.textContent = 'Создать';
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  avatarSubmitButton.textContent = 'Сохранение...';

  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      renderUserInfo(userData);
      avatarForm.reset();
      clearValidation(avatarForm, validationConfig);
      closePopup(avatarPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarSubmitButton.textContent = 'Сохранить';
    });
}

function handleRemoveCardSubmit(evt) {
  evt.preventDefault();
  if (!cardToDeleteId || !cardToDeleteElement) {
    return;
  }
  removeCardSubmitButton.textContent = 'Удаление...';

  removeExistingCard(cardToDeleteId)
    .then(() => {
      removeCardElement(cardToDeleteElement);
      cardToDeleteId = null;
      cardToDeleteElement = null;
      closePopup(removeCardPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      removeCardSubmitButton.textContent = 'Да';
    });
}

profileEditButton.addEventListener('click', () => {
  profileNameInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openPopup(profilePopup);
});

profileAddButton.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openPopup(cardPopup);
});

profileImage.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openPopup(avatarPopup);
});

profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);
removeCardForm.addEventListener('submit', handleRemoveCardSubmit);

popups.forEach((popup) => {
  setPopupEventListeners(popup);
});

enableValidation(validationConfig);

Promise.all([fetchUserData(), fetchCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    renderUserInfo(userData);
    cards.forEach((card) => {
      const cardElement = createCard(
        card,
        currentUserId,
        handleDeleteClick,
        handleLikeClick,
        handleImageClick,
        handleInfoClick
      );
      placesList.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });
