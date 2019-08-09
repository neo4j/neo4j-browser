/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

export {
  default as getAllUserFavorites
} from './methods/get-all-user-favorites'
export { default as createUserFavorite } from './methods/create-user-favorite'
export {
  default as createManyUserFavorites
} from './methods/create-many-user-favorites'
export { default as updateUserFavorite } from './methods/update-user-favorite'
export {
  default as updateManyUserFavorites
} from './methods/update-many-user-favorites'
export { default as removeUserFavorite } from './methods/remove-user-favorite'
export {
  default as removeManyUserFavorites
} from './methods/remove-many-user-favorites'
