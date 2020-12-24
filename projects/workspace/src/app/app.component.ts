import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'workspace';

  pluginOps = [
    'abc',
    '123'
  ]

  onClick(data) {
    console.log('12321321');
  }
}
