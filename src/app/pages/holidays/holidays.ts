import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HolidayService, Country, PublicHoliday } from '../../services/holiday.service';

@Component({
  selector: 'app-holidays',
  standalone: false,
  templateUrl: './holidays.html',
  styleUrl: './holidays.css',
})
export class Holidays implements OnInit {
  countries: Country[] = [];
  selectedCountry: string = '';
  holidays: PublicHoliday[] = [];
  todayHolidays: PublicHoliday[] = [];
  allHolidays: PublicHoliday[] = [];
  filteredHolidays: PublicHoliday[] = [];

  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';

  showCreateForm: boolean = false;
  newHoliday = {
    date: '',
    localName: '',
    name: '',
    countryCode: '',
    global: true,
    counties: [] as string[],
    launchYear: null as number | null,
    types: ['Public'] as string[],
  };

  loading: boolean = false;
  currentYear: number = new Date().getFullYear();

  constructor(
    private holidayService: HolidayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.holidayService.getAvailableCountries().subscribe({
      next: (countries) => {
        this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.cdr.detectChanges();
      },
    });
  }

  onCountryChange(): void {
    if (this.selectedCountry) {
      this.loadHolidays();
    } else {
      this.holidays = [];
      this.todayHolidays = [];
      this.allHolidays = [];
      this.filteredHolidays = [];
      this.cdr.detectChanges();
    }
  }

  loadHolidays(): void {
    if (!this.selectedCountry) return;

    this.loading = true;
    this.cdr.detectChanges();
    this.holidayService.getPublicHolidays(this.currentYear, this.selectedCountry).subscribe({
      next: (holidays) => {
        this.holidays = holidays;
        this.allHolidays = [...holidays];
        this.applyFilters();
        this.checkTodayHoliday();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading holidays:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  checkTodayHoliday(): void {
    if (!this.selectedCountry) return;

    const today = this.getTodayDateString();
    
    // Check all holidays (both fetched and created) for today's date
    this.todayHolidays = this.allHolidays.filter((holiday) => holiday.date === today);
    
    // If no holiday found in allHolidays, check next holidays from API
    if (this.todayHolidays.length === 0) {
      this.holidayService.getNextPublicHolidays(this.selectedCountry).subscribe({
        next: (nextHolidays) => {
          const todayHoliday = nextHolidays.find((h) => h.date === today);
          if (todayHoliday) {
            this.todayHolidays = [todayHoliday];
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  applyFilters(): void {
    let filtered = [...this.allHolidays];

    // Date range filter
    if (this.startDate) {
      filtered = filtered.filter((h) => h.date >= this.startDate);
    }
    if (this.endDate) {
      filtered = filtered.filter((h) => h.date <= this.endDate);
    }

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(searchLower) ||
          h.localName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredHolidays = filtered;
    this.cdr.detectChanges();
  }

  onStartDateChange(): void {
    this.applyFilters();
  }

  onEndDateChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newHoliday.countryCode = this.selectedCountry;
    }
  }

  createHoliday(): void {
    if (!this.newHoliday.date || !this.newHoliday.name) {
      alert('Please fill in required fields (Date and Name)');
      return;
    }

    const holiday: PublicHoliday = {
      date: this.newHoliday.date,
      localName: this.newHoliday.localName || this.newHoliday.name,
      name: this.newHoliday.name,
      countryCode: this.newHoliday.countryCode || this.selectedCountry,
      global: this.newHoliday.global,
      counties: this.newHoliday.counties.length > 0 ? this.newHoliday.counties : null,
      launchYear: this.newHoliday.launchYear,
      types: this.newHoliday.types,
    };

    this.allHolidays.push(holiday);
    this.allHolidays.sort((a, b) => a.date.localeCompare(b.date));
    this.applyFilters();
    
    // Check if the newly created holiday is today's holiday
    this.checkTodayHoliday();

    // Reset form
    this.newHoliday = {
      date: '',
      localName: '',
      name: '',
      countryCode: this.selectedCountry,
      global: true,
      counties: [],
      launchYear: null,
      types: ['Public'],
    };
    this.showCreateForm = false;
    this.cdr.detectChanges();
  }

  cancelCreateForm(): void {
    this.showCreateForm = false;
    this.newHoliday = {
      date: '',
      localName: '',
      name: '',
      countryCode: this.selectedCountry,
      global: true,
      counties: [],
      launchYear: null,
      types: ['Public'],
    };
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
