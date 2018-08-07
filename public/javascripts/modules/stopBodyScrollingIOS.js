let freezeVp = (e) => {
  e.preventDefault();
};

function stopBodyScrolling (bool) {
  if (bool === true) {
      document.body.addEventListener("touchmove", freezeVp);
  } else {
      document.body.removeEventListener("touchmove", freezeVp);
  }
}

export default stopBodyScrolling;