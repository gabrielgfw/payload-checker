import moment from "moment";

export class DateUtils {
  constructor() {
    moment.locale(this.__handleLocation());
  }

  __handleLocation() {
    const DEFAULT = "pt-BR";
    const userLocation = window.navigator?.language;
    return userLocation ?? DEFAULT;
  }

  newFormatedDate(format) {
    return moment().format(format);
  }
}
