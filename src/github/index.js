import { catchError, EMPTY, fromEvent } from 'rxjs';
import {map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, filter} from 'rxjs/operators'
import {ajax} from 'rxjs/ajax'

const URL = 'https://api.github.com/search/users?q=';

const search = document.getElementById('search')
const result = document.getElementById('result')

const stream$ = fromEvent(search, 'input')
  .pipe(
    map(event => event.target.value),
    debounceTime(1000),
    distinctUntilChanged(),
    tap(() => result.innerHTML = ''),
    filter(value => value.trim()),
    switchMap(value => ajax.getJSON(URL + value).pipe(
      catchError(err => EMPTY)
    )),
    mergeMap(response => response.items)
  )
  .subscribe(user => {
    const html = `
    <div class="card">
      <div class="card-image">
        <img src="${user.avatar_url}"/>
        <span class="card-title">${user.login}</span>
      </div>
      <div class="card-action">
        <a href="${user.html_url}" target="_blank">Открыть профиль</a>
      </div>
    </div>
    `
    result.insertAdjacentHTML('beforeend', html)
  })
