import React, { useState, useEffect } from "react";
import "./KnowledgeGraphViewer.css";

const KnowledgeGraphViewer = ({ kgData, isOpen, onClose }) => {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    if (kgData && isOpen) {
      try {
        let parsedData;
        if (typeof kgData === "string") {
          let cleaned = kgData.trim();
          if (cleaned.startsWith("```json")) {
            cleaned = cleaned.slice(7);
          }
          if (cleaned.endsWith("```")) {
            cleaned = cleaned.slice(0, -3);
          }
          parsedData = JSON.parse(cleaned);
        } else {
          parsedData = kgData;
        }
        setGraphData(parsedData);
      } catch (error) {
        console.error("Error parsing knowledge graph:", error);
        setGraphData(null);
      }
    }
  }, [kgData, isOpen]);

  if (!isOpen) return null;

  const nodes = graphData?.nodes || [];
  const relationships = graphData?.relationships || [];

  const colorMap = {
    symptom: "#e74c3c",
    disease: "#3498db",
    treatment: "#2ecc71",
    outcome: "#f39c12",
    error: "#7f8c8d",
    unknown: "#bdc3c7",
  };

  // Calculate node positions in a circle
  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 7;
    return {
      ...node,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });

  return (
    <div className="kg-modal-overlay" onClick={onClose}>
      <div className="kg-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="kg-modal-header">
          <h2>🧠 Knowledge Graph Visualization</h2>
          <button className="kg-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="kg-modal-body">
          {!graphData || nodes.length === 0 ? (
            <div className="kg-empty-state">
              <p>No knowledge graph data available</p>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="kg-legend">
                {Object.entries(colorMap).map(([type, color]) => (
                  <div key={type} className="kg-legend-item">
                    <div
                      className="kg-legend-color"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </div>
                ))}
              </div>

              {/* Graph Visualization */}
              <div className="kg-graph-container">
                <svg
                  className="kg-svg"
                  viewBox="-10 -10 20 20"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Draw edges first (behind nodes) */}
                  {relationships.map((rel, idx) => {
                    const sourceNode = nodePositions.find(
                      (n) => n.id === rel.source
                    );
                    const targetNode = nodePositions.find(
                      (n) => n.id === rel.target
                    );
                    if (!sourceNode || !targetNode) return null;
                    return (
                      <line
                        key={`edge-${idx}`}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#999"
                        strokeWidth="0.3"
                      />
                    );
                  })}

                  {/* Draw nodes */}
                  {nodePositions.map((node) => {
                    const nodeType = (node.type || "unknown").toLowerCase();
                    const color = colorMap[nodeType] || colorMap.unknown;
                    const label = node.label || node.id;

                    return (
                      <g key={`node-${node.id}`}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="1.5"
                          fill={color}
                          stroke="white"
                          strokeWidth="0.2"
                        />
                        <text
                          x={node.x}
                          y={node.y + 2.5}
                          textAnchor="middle"
                          fontSize="0.8"
                          fill="#333"
                          className="kg-node-label"
                        >
                          {label.length > 10
                            ? label.substring(0, 10) + "..."
                            : label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Node and Relationship Count */}
              <div className="kg-stats">
                <div className="kg-stat">
                  <span className="kg-stat-icon">🧠</span>
                  <span className="kg-stat-label">Nodes:</span>
                  <span className="kg-stat-value">{nodes.length}</span>
                </div>
                <div className="kg-stat">
                  <span className="kg-stat-icon">🔗</span>
                  <span className="kg-stat-label">Relationships:</span>
                  <span className="kg-stat-value">{relationships.length}</span>
                </div>
              </div>

              {/* Node List */}
              <div className="kg-nodes-list">
                <h4>Nodes:</h4>
                <div className="kg-nodes-grid">
                  {nodes.map((node) => {
                    const nodeType = (node.type || "unknown").toLowerCase();
                    const color = colorMap[nodeType] || colorMap.unknown;
                    return (
                      <div
                        key={node.id}
                        className="kg-node-item"
                        style={{ borderLeft: `4px solid ${color}` }}
                      >
                        <strong>{node.label || node.id}</strong>
                        <span className="kg-node-type">{nodeType}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Relationships List */}
              {relationships.length > 0 && (
                <div className="kg-relationships-list">
                  <h4>Relationships:</h4>
                  <div className="kg-relationships-grid">
                    {relationships.map((rel, idx) => {
                      const sourceNode = nodes.find((n) => n.id === rel.source);
                      const targetNode = nodes.find((n) => n.id === rel.target);
                      return (
                        <div key={idx} className="kg-relationship-item">
                          <span className="kg-rel-source">
                            {sourceNode?.label || rel.source}
                          </span>
                          <span className="kg-rel-arrow">→</span>
                          <span className="kg-rel-target">
                            {targetNode?.label || rel.target}
                          </span>
                          {rel.type && (
                            <span className="kg-rel-type">({rel.type})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphViewer;
