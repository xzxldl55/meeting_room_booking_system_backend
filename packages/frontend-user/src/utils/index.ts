export function locationTo(href: string) {
  // eslint-disable-next-line no-restricted-globals
  location.href = href;
}

export function getUserInfo () {
  const userInfo = localStorage.getItem('userInfo');

  if (userInfo) {
    return JSON.parse(userInfo);
  }
}