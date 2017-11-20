import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-404',
  template: `
    <article>
      <h1>Inconceivable!</h1>
      <div>I do not think this page is where you think it is.</div>
    </article>
  `
})
export class PageNotFoundComponent {}
