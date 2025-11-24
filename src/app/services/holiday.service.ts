import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Country {
  countryCode: string;
  name: string;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private baseUrl = 'https://date.nager.at';
  private apiUrl = `${this.baseUrl}/api/v3`;

  constructor(private http: HttpClient) {}

  getAvailableCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/AvailableCountries`);
  }

  getPublicHolidays(year: number, countryCode: string): Observable<PublicHoliday[]> {
    return this.http.get<PublicHoliday[]>(`${this.apiUrl}/PublicHolidays/${year}/${countryCode}`);
  }

  isTodayPublicHoliday(countryCode: string): Observable<boolean> {
    return new Observable(observer => {
      this.http.get(`${this.apiUrl}/IsTodayPublicHoliday/${countryCode}`, { observe: 'response' })
        .subscribe({
          next: (response) => {
            observer.next(response.status === 200);
            observer.complete();
          },
          error: (error) => {
            observer.next(false);
            observer.complete();
          }
        });
    });
  }

  getNextPublicHolidays(countryCode: string): Observable<PublicHoliday[]> {
    return this.http.get<PublicHoliday[]>(`${this.apiUrl}/NextPublicHolidays/${countryCode}`);
  }
}

