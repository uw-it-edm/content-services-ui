import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../model/config';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.css']
})
export class TenantComponent implements OnInit {
  config: Config;
  tenant: string;

  constructor(private route: ActivatedRoute, private titleService: Title) {
  }

  getPageList(): string[] {
    return Object.keys(this.config.pages).sort();
  }

  ngOnInit(): void {
    this.route.data
      .subscribe((data: { config: Config }) => {
          this.config = data.config;
        }
      );
    this.route.paramMap
      .subscribe(
        params => {
          this.tenant = params.get('tenant');
          this.setPageTitle();
        });
  }


  private setPageTitle() {
    this.titleService.setTitle(this.tenant);
  }
}
