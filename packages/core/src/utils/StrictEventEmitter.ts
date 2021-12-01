// Copyright 2021 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { EventEmitter } from 'events'

/**
 * An events map is an interface that maps event names to their value, which
 * represents the type of the `on` listener.
 */
export interface EventsMap {
  [event: string]: any
}

/**
 * The default events map, used if no EventsMap is given. Using this EventsMap
 * is equivalent to accepting all event names, and any data.
 */
export interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void
}

/**
 * Returns a union type containing all the keys of an event map.
 */
export type EventNames<Map extends EventsMap> = keyof Map & (string | symbol)

/** The tuple type representing the parameters of an event listener */
export type EventParams<Map extends EventsMap, Ev extends EventNames<Map>> = Parameters<Map[Ev]>

/**
 * The event names that are either in ReservedEvents or in UserEvents
 */
export type ReservedOrUserEventNames<
  ReservedEventsMap extends EventsMap,
  UserEvents extends EventsMap
> = EventNames<ReservedEventsMap> | EventNames<UserEvents>

/**
 * Type of a listener of a user event or a reserved event. If `Ev` is in
 * `ReservedEvents`, the reserved event listener is returned.
 */
export type ReservedOrUserListener<
  ReservedEvents extends EventsMap,
  UserEvents extends EventsMap,
  Ev extends ReservedOrUserEventNames<ReservedEvents, UserEvents>
> = FallbackToUntypedListener<
  Ev extends EventNames<ReservedEvents>
    ? ReservedEvents[Ev]
    : Ev extends EventNames<UserEvents>
    ? UserEvents[Ev]
    : never
>

/**
 * Returns an untyped listener type if `T` is `never`; otherwise, returns `T`.
 *
 * This is a hack to mitigate https://github.com/socketio/socket.io/issues/3833.
 * Needed because of https://github.com/microsoft/TypeScript/issues/41778
 */
type FallbackToUntypedListener<T> = [T] extends [never] ? (...args: any[]) => void : T

/**
 * Interface for classes that aren't `EventEmitter`s, but still expose a
 * strictly typed `emit` method.
 */
export interface TypedEventBroadcaster<EmitEvents extends EventsMap> {
  emit<Ev extends EventNames<EmitEvents>>(ev: Ev, ...args: EventParams<EmitEvents, Ev>): boolean
}

/**
 * Strictly typed version of an `EventEmitter`. A `TypedEventEmitter` takes type
 * parameters for mappings of event names to event data types, and strictly
 * types method calls to the `EventEmitter` according to these event maps.
 *
 * @typeParam ListenEvents - `EventsMap` of user-defined events that can be
 * listened to with `on` or `once`
 * @typeParam EmitEvents - `EventsMap` of user-defined events that can be
 * emitted with `emit`
 * @typeParam ReservedEvents - `EventsMap` of reserved events, that can be
 * emitted by socket.io with `emitReserved`, and can be listened to with
 * `listen`.
 */
export abstract class StrictEventEmitter<
    ListenEvents extends EventsMap,
    EmitEvents extends EventsMap,
    ReservedEvents extends EventsMap = {}
  >
  extends EventEmitter
  implements TypedEventBroadcaster<EmitEvents>
{
  /**
   * Adds the `listener` function as an event listener for `ev`.
   *
   * @param ev Name of the event
   * @param listener Callback function
   */
  on<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
    ev: Ev,
    listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): this {
    return super.on(ev, listener)
  }

  /**
   * Adds a one-time `listener` function as an event listener for `ev`.
   *
   * @param ev Name of the event
   * @param listener Callback function
   */
  once<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
    ev: Ev,
    listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): this {
    return super.once(ev, listener)
  }

  /**
   * Emits an event.
   *
   * @param ev Name of the event
   * @param args Values to send to listeners of this event
   */
  emit<Ev extends EventNames<EmitEvents>>(ev: Ev, ...args: EventParams<EmitEvents, Ev>): boolean {
    return super.emit(ev, ...args)
  }

  /**
   * Emits a reserved event.
   *
   * This method is `protected`, so that only a class extending
   * `StrictEventEmitter` can emit its own reserved events.
   *
   * @param ev Reserved event name
   * @param args Arguments to emit along with the event
   */
  protected emitReserved<Ev extends EventNames<ReservedEvents>>(
    ev: Ev,
    ...args: EventParams<ReservedEvents, Ev>
  ): boolean {
    return super.emit(ev, ...args)
  }

  /**
   * Emits an event.
   *
   * This method is `protected`, so that only a class extending
   * `StrictEventEmitter` can get around the strict typing. This is useful for
   * calling `emit.apply`, which can be called as `emitUntyped.apply`.
   *
   * @param ev Event name
   * @param args Arguments to emit along with the event
   */
  protected emitUntyped(ev: string, ...args: any[]): boolean {
    return super.emit(ev, ...args)
  }

  /**
   * Returns the listeners listening to an event.
   *
   * @param event Event name
   * @returns Array of listeners subscribed to `event`
   */
  listeners<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
    event: Ev
  ): ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>[] {
    return super.listeners(event) as ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>[]
  }
}
