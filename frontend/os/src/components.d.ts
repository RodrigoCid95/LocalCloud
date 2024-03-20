/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { Detail } from "./components/lco-auth";
export { Detail } from "./components/lco-auth";
export namespace Components {
    interface LcoAuth {
    }
    interface LcoDashboard {
    }
}
export interface LcoAuthCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLLcoAuthElement;
}
declare global {
    interface HTMLLcoAuthElement extends Components.LcoAuth, HTMLStencilElement {
    }
    var HTMLLcoAuthElement: {
        prototype: HTMLLcoAuthElement;
        new (): HTMLLcoAuthElement;
    };
    interface HTMLLcoDashboardElement extends Components.LcoDashboard, HTMLStencilElement {
    }
    var HTMLLcoDashboardElement: {
        prototype: HTMLLcoDashboardElement;
        new (): HTMLLcoDashboardElement;
    };
    interface HTMLElementTagNameMap {
        "lco-auth": HTMLLcoAuthElement;
        "lco-dashboard": HTMLLcoDashboardElement;
    }
}
declare namespace LocalJSX {
    interface LcoAuth {
        "onLogged-in"?: (event: LcoAuthCustomEvent<Detail>) => void;
    }
    interface LcoDashboard {
    }
    interface IntrinsicElements {
        "lco-auth": LcoAuth;
        "lco-dashboard": LcoDashboard;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "lco-auth": LocalJSX.LcoAuth & JSXBase.HTMLAttributes<HTMLLcoAuthElement>;
            "lco-dashboard": LocalJSX.LcoDashboard & JSXBase.HTMLAttributes<HTMLLcoDashboardElement>;
        }
    }
}