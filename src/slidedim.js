function Slidedim(selector, options = {}) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Slidedim: Container "${selector}" not found!`);
    return;
  }

  this.opt = Object.assign(
    {
      items: 0,
      speed: 0,
      loop: false,
    },
    options,
  );
  this.slides = Array.from(this.container.children);
  this.currentIndex = this.opt.loop ? this.opt.items : 0;

  this._init();
  this._updatePosition();
}

Slidedim.prototype._init = function () {
  this.container.classList.add("slidedim-wrapper");
  this._createTrack();
  this._CreateNavigation();
};

Slidedim.prototype._createTrack = function () {
  this.track = document.createElement("div");
  this.track.className = "slidedim-track";

  if (this.opt.loop) {
    const cloneHead = this.slides
      .slice(-this.opt.items)
      .map((node) => node.cloneNode(true));
    const cloneTail = this.slides
      .slice(0, -this.opt.items)
      .map((node) => node.cloneNode(true));

    this.slides = cloneHead.concat(this.slides.concat(cloneTail));
  }

  this.slides.forEach((slide) => {
    slide.classList.add("slidedim-slide");
    slide.style.flexBasis = `calc(100% / ${this.opt.items})`;
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
  if (this._isAnimating) return;
  this._isAnimating = true;

  const maxIndex = this.slides.length - this.opt.items;

  this.currentIndex = Math.min(Math.max(this.currentIndex + step, 0), maxIndex);
  setTimeout(() => {
    if (this.opt.loop) {
      if (this.currentIndex <= 0) {
        this.currentIndex = maxIndex - this.opt.items;
      } else if (this.currentIndex >= maxIndex) {
        this.currentIndex = this.opt.items;
      }
      this._updatePosition(true);
    }
    this._isAnimating = false;
  }, this.opt.speed);

  this._updatePosition();
};

Slidedim.prototype._updatePosition = function (instant = false) {
  this.track.style.transition = instant
    ? "none"
    : `transform ease ${this.opt.speed}ms`;
  this.offset = -(this.currentIndex * (100 / this.opt.items));
  this.track.style.transform = `translateX(${this.offset}%)`;
};
