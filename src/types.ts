import React, {
  Component,
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardRefExoticComponent,
  LazyExoticComponent,
  MemoExoticComponent,
  PropsWithoutRef,
  PropsWithRef,
  ReactElement,
  RefAttributes,
} from "react";

export type Merge<A, B> = Omit<A, keyof B> & B;

/** Adds `as` property as an optional prop */
export type WithAs<
  Props extends object,
  Type extends ElementType = ElementType
> = { as?: Type } & Props;

// take this explanation with a pinch of salt, i'm only guessing:
//
// If the restrictions are only JSX.IntrinsicElement restrictions, typescript
// will understand what the props will be and therefore make an assumption that
// the props will either be props<a> | props<button> | etc.. Now the problem is when
// `as` is used typescript will say that there is a possibility that `as` will be "a" and props
// will be "props<button>", we know that that isn't possible but there is no way to tell
// typescript that it will never happen.
//
// That's why when we add a function to the union, typescript won't know for sure what the props
// of that function will be so it won't bother checking, now it just marks props as props<T> and `as`
// as T and only checks when the component is used.
export type OnlyAs<T extends ElementType> = T | (() => null);

// ----------------------------------------------
// PROP TYPES
// ----------------------------------------------

// for some reason, removing PropsWithRef<T> from this type makes this a lot faster.
// don't ask me how, it just does. The PropsWithRef<T> type was just lifted to the top.
//
// I'm guessing its because its not being cached by typescript because it's
// placed inside a conditional (`PropsWithRef<ComponentProps<T>>`)
export type _ComponentPropsWithRef<T extends ElementType> = T extends new (
  props: infer P
) => Component<any, any>
  ? PropsWithoutRef<P> & RefAttributes<InstanceType<T>>
  : ComponentProps<T>;

export type PolymorphicPropsWithoutRef<
  Component extends ElementType,
  Props extends object = {}
> = Merge<ComponentPropsWithoutRef<Component>, WithAs<Props, Component>>;

export type PolymorphicPropsWithRef<
  Component extends ElementType,
  Props extends object = {}
> = Merge<
  PropsWithRef<_ComponentPropsWithRef<Component>>,
  WithAs<Props, Component>
>;

// ----------------------------------------------
// COMPONENT TYPES
// ----------------------------------------------

interface ComponentBase {
  displayName?: string;
  propTypes?: React.WeakValidationMap<any>;
  contextTypes?: React.ValidationMap<any>;
  defaultProps?: Partial<any>;
  id?: string;
}

export interface CallWithoutRef<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> {
  <Component extends OnlyAs = Default>(
    props: PolymorphicPropsWithoutRef<Component, Props>
  ): ReactElement | null;
}

export interface CallWithRef<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> {
  <Component extends OnlyAs = Default>(
    props: PolymorphicPropsWithRef<Component, Props>
  ): ReactElement | null;
}

export interface PolymorphicComponent<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> extends ComponentBase,
    CallWithoutRef<Default, Props, OnlyAs> {}

/**
 * adds the ref attribute to PolymorphicComponent, usually you shouldn't
 * have to use this as you can just use `forwardRef()`
 */
export interface PolymorphicComponentWithRef<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> extends ComponentBase,
    CallWithRef<Default, Props, OnlyAs> {}

// ----------------------------------------------
// EXOTIC COMPONENTS
//
// $Merge below isn't actually doing anything except for removing the call signatures off of
// the first type passed (Omit<A, never> & B), then we replace the call signature with our generic
// function.
// ----------------------------------------------

export type PolyForwardExoticComponent<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> = Merge<
  ForwardRefExoticComponent<Props & { [key: string]: unknown }>,
  CallWithRef<Default, Props, OnlyAs>
>;

/**
 * MemoExoticComponent but with support for polymorph. Note that if your polymorphic component
 * has ref forwarded, you should use `PolyForwardMemoExoticComponent` instead.
 */
export type PolyMemoExoticComponent<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> = Merge<
  MemoExoticComponent<React.ComponentType<any>>,
  CallWithoutRef<Default, Props, OnlyAs>
>;

/**
 * MemoExoticComponent but with support for polymorph.
 * makes it clear that the component does support refs if possible.
 */
export type PolyForwardMemoExoticComponent<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> = Merge<
  MemoExoticComponent<React.ComponentType<any>>,
  CallWithRef<Default, Props, OnlyAs>
>;

/**
 * LazyExoticComponent but with support for polymorph. Note that if your polymorphic component
 * has ref forwarded, you should use `PolyForwardMemoExoticComponent` instead.
 */
export type PolyLazyExoticComponent<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> = Merge<
  LazyExoticComponent<React.ComponentType<any>>,
  CallWithoutRef<Default, Props, OnlyAs>
>;

/**
 * LazyExoticComponent but with support for polymorph.
 * makes it clear that the component does support refs if possible.
 */
export type PolyForwardLazyExoticComponent<
  Default extends OnlyAs,
  Props extends object = {},
  OnlyAs extends ElementType = ElementType
> = Merge<
  LazyExoticComponent<React.ComponentType<any>>,
  CallWithRef<Default, Props, OnlyAs>
>;
