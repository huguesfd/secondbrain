import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function CytoscapeGraph({ nodes, edges, subject }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const cy = cytoscape({
      container: ref.current,
      elements: [...nodes, ...edges],
      layout: { name: "breadthfirst", directed: true, padding: 20 },
      style: [
        { selector: "node", style: { "label": "data(label)", "text-wrap": "wrap", "text-max-width": 120, "font-size": 10 } },
        { selector: "edge", style: { "width": 2, "target-arrow-shape": "triangle" } }
      ]
    });

    cy.on("tap", "node", (evt) => {
      const id = evt.target.id(); // subject/nodeSlug
      const nodeSlug = id.split("/")[1];
      window.location.href = `/${subject}/${nodeSlug}/`;
    });

    return () => cy.destroy();
  }, [nodes, edges, subject]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}