import moment from 'moment';

export const convertDate = (date: Date | string) => {
  return moment(date).format('YYYY');
};
export const convertTime = (date: Date | string) => {
  return moment(date).format('h:mm A');
};

export const AmountFormatter = (amt: string | number) => {
  return `\u20B9${
    !!amt
      ? amt?.toString().replace(/\B(?=(?:(\d\d)+(\d)(?!\d))+(?!\d))/g, ',')
      : ''
  }`;
};
