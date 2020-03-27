import DateNageAPI from "@services/dateNager.service";

interface IDate {
  formatted: Date;
  full: string;
  weekend: boolean;
  lastBusinessDayOfMonth: boolean;
  holiday: boolean;
}

export class RangeDate {
  public dates: IDate[];
  private dateNageAPI: DateNageAPI;
  constructor() {
    this.dates = [];
    this.dateNageAPI = new DateNageAPI();
  }

  public async init(dateStart: string, dateEnd: string) {
    const dates = this.generateDate(dateStart, dateEnd);
    const years = [ ...new Set( dates.map( date => this.dateFormat(date).getFullYear() ) ) ];
    const holidays = await this.generateHolidayByYear(years);
    const lastBusinessDatesOfMonth = this.generateLastBusinessDateOfMonth(dates, holidays);
    this.dates = dates.map( date => ({
      formatted: this.dateFormat(date),
      full: date,
      weekend: [0, 6].includes( this.dateFormat(date).getDay() ),
      holiday: holidays.includes(date),
      lastBusinessDayOfMonth: lastBusinessDatesOfMonth.includes(date)
    }));
  }

  private generateDate(dateStart: string, dateEnd: string) {
    const [year, month]: string[] = dateEnd.split('-');
    const daterEndLastDayMonth = new Date(Number(year), Number(month), 0).toISOString().substring(0, 10);
    let dates = [dateStart];
    do {
      const dateNext = this.dateFormat(dates[0], 1).toISOString().substring(0, 10);
      dates = [dateNext, ...dates];
    } while (dates[0] !== daterEndLastDayMonth);

    return dates;
  }

  private dateFormat(date: string, number: number = 0) {
    const [year, month, day]: string[] = date.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day) + number);
  }

  private async generateHolidayByYear(years: number[]) {
    const holidays = await this.dateNageAPI.getPublicHolidays(years, "BR");
    return holidays
      .flatMap( holiday => holiday )
      .map(holiday => holiday.date);
  }

  private generateLastBusinessDateOfMonth(dates: string[], holidays: string[]) {
    return dates.reduce((arr: string[], date) => {
      const yearMonth = date.substring(0, 7);
      if( ![0, 6].includes( this.dateFormat(date).getDay() ) && !holidays.includes(date) && !new RegExp(yearMonth).test(arr.join("")) ) {
        return arr.concat(date)
      }
      return arr;
    }, []);
  }
};