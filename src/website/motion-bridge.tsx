/** Lightweight motion compatibility for the attached prototype.
 * Keeps its original UI and event handlers without a runtime animation dependency.
 * The new website uses native CSS animations.
 */
import React, { forwardRef, type ReactNode } from 'react';
const cache:Record<string,any>={};
const motionProps=new Set(['initial','animate','exit','transition','whileHover','whileTap','whileInView','whileFocus','whileDrag','layout','layoutId','variants','viewport','drag','dragConstraints','onAnimationComplete','onUpdate']);
export const motion=new Proxy({}, {get(_,tag:string){if(!cache[tag])cache[tag]=forwardRef<any,any>((props,ref)=>{const clean:Record<string,any>={};for(const key in props)if(!motionProps.has(key))clean[key]=props[key];if(props.animate&&typeof props.animate==='object'){const animated:Record<string,any>={};for(const k of ['opacity','height','width','backgroundColor','color']){const v=props.animate[k];if(typeof v==='string'||typeof v==='number')animated[k]=v}clean.style={...animated,...props.style}}return React.createElement(tag,{...clean,ref})});return cache[tag]}}) as Record<string,any>;
export function AnimatePresence({children}:{children?:ReactNode;[key:string]:unknown}){return <>{children}</>}
