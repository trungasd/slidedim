function Slidedim(selector, options = {}) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Slidedim: Container "${selector}" not found!`);
    return;
  }

  this.opt = Object.assign({}, options);
  this.slides = Array.from(this.container.children);
  this.currentIndex = 0;

  this._init();
}

Slidedim.prototype._init = function () {
  this.container.classList.add("slidedim-wrapper");
  this._createTrack();
  this._CreateNavigation();
};

Slidedim.prototype._createTrack = function () {
  this.track = document.createElement("div");
  this.track.className = "slidedim-track";

  this.slides.forEach((slide) => {
    slide.classList.add("slidedim-slide");
    this.track.appendChild(slide);
  });

  this.container.appendChild(this.track);
};

Slidedim.prototype._CreateNavigation = function () {
  this.prevbtn = document.createElement("button");
  this.prevbtn.className = "slidedim-prev";
  this.prevbtn.innerText = "<";

  this.nextBtn = document.createElement("button");
  this.nextBtn.className = "slidedim-next";
  this.nextBtn.innerText = ">";

  this.container.append(this.prevbtn, this.nextBtn);

  this.prevbtn.onclick = () => this.moveSlide(-1);
  this.nextBtn.onclick = () => this.moveSlide(1);
};

Slidedim.prototype.moveSlide = function (step) {
  this.currentIndex = Math.min(
    Math.max(this.currentIndex + step, 0),
    this.slides.length - 3,
  );
  this.offset = -(this.currentIndex * (100 / 3));
  this.track.style.transform = `translateX(${this.offset}%)`;
};
