const TRANSFORM_TYPE_ROTATE = 0;
const TRANSFORM_TYPE_MOVE = 1;

const toRadians = (degrees) => {
	return degrees * Math.PI / 180;
};

export class Transform {

  #type;
  #axis;
  #value;

  constructor(type, axis, value) {
    this.#type = type;
    this.#axis = axis;
    this.#value = value;
  }

  apply(geometry) {
    if (this.#type == TRANSFORM_TYPE_ROTATE) {
      switch (this.#axis) {
        case 0:
          return geometry.rotateX(toRadians(this.#value));
        case 1:
          return geometry.rotateY(toRadians(this.#value));
        case 2:
          return geometry.rotateZ(toRadians(this.#value));
      }
    } else if (this.#type == TRANSFORM_TYPE_MOVE) {
      switch (this.#axis) {
        case 0:
          return geometry.translateX(this.#value);
        case 1:
          return geometry.translateY(this.#value);
        case 2:
          return geometry.translateZ(this.#value);
      }
    }
  }

  revert(geometry) {
    this.#value = -this.#value;
    this.apply(geometry);
    this.#value = -this.#value;
  }
};
