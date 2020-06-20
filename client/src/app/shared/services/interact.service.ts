import {Injectable} from "@angular/core";
import * as interact from "interactjs"

@Injectable({
  providedIn: "root"
})

export class InteractService {

  constructor() {
  }

  dragMoveListener(event) {
    const target = event.target
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)'
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
  }

  draggable(el) {
    const interactHandle = (<any>interact);
    interactHandle(el)
      .resizable({
        edges: {left: true, right: true, bottom: true, top: true},
        listeners: {
          move(event) {
            const target = event.target
            let x = (parseFloat(target.getAttribute('data-x')) || 0)
            let y = (parseFloat(target.getAttribute('data-y')) || 0)
            target.style.width = event.rect.width + 'px'
            target.style.height = event.rect.height + 'px'
            x += event.deltaRect.left
            y += event.deltaRect.top
            target.style.webkitTransform = target.style.transform =
              'translate(' + x + 'px,' + y + 'px)'
            target.setAttribute('data-x', x)
            target.setAttribute('data-y', y)
          }
        },
        modifiers: [
          interactHandle.modifiers.restrictEdges({
            // outer: 'parent'
          }),
          interactHandle.modifiers.restrictSize({
            min: {width: 300, height: 400}
          })
        ],
        inertia: true
      })
      .draggable({
        listeners: {move: this.dragMoveListener},
        inertia: true,
        modifiers: [
          interactHandle.modifiers.restrictRect({
            // restriction: 'parent',
            endOnly: true
          })
        ]
      })
  }
}
