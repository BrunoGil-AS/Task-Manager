import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './UI/navbar/navbar';
import { Footer } from './UI/footer/footer';
import { GlobalError } from './UI/global-error/global-error';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, GlobalError],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('task-manager');
}
