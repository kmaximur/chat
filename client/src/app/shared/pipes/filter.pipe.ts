import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: any): any {
    if (!items)
      return items;
    else if (!filter)
      return items;
    else if (!filter.filterText && filter.filterActive === 'All')
      return items;
    else if (!filter.filterText && filter.filterActive === 'Active')
      return items.filter(item => item.active);
    else if (!filter.filterText && filter.filterActive === 'NoActive')
      return items.filter(item => !item.active);

    const f = filter.filterText.split(' ')

    if (filter.filterActive === 'All')
      return items.filter(item =>
        (f.length == 1 && (item.login.includes(f[0]) || (item.name.includes(f[0])) || (item.sirname.includes(f[0])))) ||
        (f.length === 2 && item.name.includes(f[0]) && item.sirname.includes(f[1])) ||
        (f.length === 2 && item.name.includes(f[1]) && item.sirname.includes(f[0])));
    else if (filter.filterActive === 'Active')
      return items.filter(item =>
        (f.length == 1 && (item.login.includes(f[0]) || (item.name.includes(f[0])) || (item.sirname.includes(f[0]))) && item.active) ||
        (f.length === 2 && item.name.includes(f[0]) && item.sirname.includes(f[1]) && item.active) ||
        (f.length === 2 && item.name.includes(f[1]) && item.sirname.includes(f[0]) && item.active));
    else if (filter.filterActive === 'NoActive')
      return items.filter(item =>
        (f.length == 1 && (item.login.includes(f[0]) || (item.name.includes(f[0])) || (item.sirname.includes(f[0]))) && !item.active) ||
        (f.length === 2 && item.name.includes(f[0]) && item.sirname.includes(f[1]) && !item.active) ||
        (f.length === 2 && item.name.includes(f[1]) && item.sirname.includes(f[0]) && !item.active));
  }
}
