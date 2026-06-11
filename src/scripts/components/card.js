const cardTemplate = document.querySelector('#card-template').content;

export function createCard(
  cardData,
  currentUserId,
  onDeleteCard,
  onLikeCard,
  onImageClick,
  onInfoClick
) {
  const cardElement = cardTemplate.querySelector('.places__item').cloneNode(true);

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  const isLikedByCurrentUser = cardData.likes.some(function (user) {
    return user._id === currentUserId;
  });
  if (isLikedByCurrentUser) {
    likeButton.classList.add('card__like-button_is-active');
  }

  if (cardData.owner._id === currentUserId) {
    deleteButton.addEventListener('click', function () {
      onDeleteCard(cardData._id, cardElement);
    });
  } else {
    deleteButton.remove();
  }

  likeButton.addEventListener('click', function () {
    onLikeCard(cardData._id, likeButton, likeCount);
  });

  cardImage.addEventListener('click', function () {
    onImageClick(cardData.name, cardData.link);
  });

  infoButton.addEventListener('click', function () {
    onInfoClick(cardData._id);
  });

  return cardElement;
}

export function updateLikeUI(likeButton, likeCount, updatedCard) {
  likeButton.classList.toggle('card__like-button_is-active');
  likeCount.textContent = updatedCard.likes.length;
}

export function removeCardElement(cardElement) {
  cardElement.remove();
}
