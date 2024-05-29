import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, take, exhaustMap, switchMap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Ingredient } from './ingredient.model';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeService,
    private authService: AuthService,
    private shoppingListService: ShoppingListService
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    return this.authService.user
      .pipe(
        take(1),
        exhaustMap((user) => {
          if (!user) {
            return of(null);
          }
          const userId = user.id;
          return this.http.put(
            `https://my-recipe-angular-default-rtdb.firebaseio.com/users/${userId}/recipes.json`,
            recipes
          );
        })
      )
      .subscribe((response) => {
        console.log(response);
      });
  }
  storeIngredients() {
    const ingredients = this.shoppingListService.getIngredients();
    return this.authService.user
      .pipe(
        take(1),
        exhaustMap((user) => {
          if (!user) {
            return of(null);
          }
          const userId = user.id;
          return this.http.put(
            `https://my-recipe-angular-default-rtdb.firebaseio.com/users/${userId}/ingredients.json`,
            ingredients
          );
        })
      )
      .subscribe((response) => {
        console.log(response);
      });
  }

  fetchRecipes() {
    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const userId = user.id;
        return this.http.get<Recipe[]>(
          `https://my-recipe-angular-default-rtdb.firebaseio.com/users/${userId}/recipes.json`
        ).pipe(
          map(recipes => {
            return recipes ? recipes.map(recipe => {
              return {
                ...recipe,
                ingredients: recipe.ingredients ? recipe.ingredients : []
              };
            }) : [];
          }),
          tap(recipes => {
            this.recipeService.setRecipes(recipes);
          })
        );
      })
    );
  }
  fetchIngredients() {
    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const userId = user.id;
        return this.http.get<Ingredient[]>(
          `https://my-recipe-angular-default-rtdb.firebaseio.com/users/${userId}/ingredients.json`
        ).pipe(
          map(ingredients => {
            return ingredients ? ingredients.map(ingredient => {
              return {
                ...ingredient,
              };
            }) : [];
          }),
          tap(ingredient => {
            this.shoppingListService.setIngredients(ingredient);
          })
        );
      })
    );
  }
}
