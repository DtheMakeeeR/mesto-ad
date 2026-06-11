const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/{{ Ваш идентификатор группы }}",
  headers: {
    authorization: "{{ Ваш личный токен }}",
    "Content-Type": "application/json",
  },
}; 

function processResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Ошибка: ${res.status}`);
}

export function fetchUserData() {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(processResponse);
}

export function fetchCardList() {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(processResponse);
}

export function updateUserProfile(userName, userAbout) {
  return fetch(`${config.baseUrl}/users/me`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify({ name: userName, about: userAbout }),
  }).then(processResponse);
}

export function updateUserAvatar(avatarUrl) {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify({ avatar: avatarUrl }),
  }).then(processResponse);
}

export function createNewCard(cardName, cardLink) {
  return fetch(`${config.baseUrl}/cards`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({ name: cardName, link: cardLink }),
  }).then(processResponse);
}

export function removeExistingCard(cardId) {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: config.headers,
  }).then(processResponse);
}

export function toggleCardLike(cardId, isLiked) {
  return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? 'DELETE' : 'PUT',
    headers: config.headers,
  }).then(processResponse);
}
