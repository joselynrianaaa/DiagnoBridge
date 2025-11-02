# utils/knowledge_graph_visualizer.py
import json
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, List, Any
import math

class KnowledgeGraphVisualizer:
    def __init__(self):
        self.node_colors = {
            'symptom': '#FF6B6B',      # Red for symptoms
            'disease': '#4ECDC4',      # Teal for diseases
            'treatment': '#45B7D1',    # Blue for treatments
            'outcome': '#96CEB4',      # Green for outcomes
            'risk_factor': '#FECA57',  # Yellow for risk factors
            'test': '#FF9FF3',         # Pink for diagnostic tests
            'default': '#95A5A6'       # Gray for unknown types
        }
        
        self.node_sizes = {
            'symptom': 25,
            'disease': 35,
            'treatment': 30,
            'outcome': 25,
            'risk_factor': 20,
            'test': 25,
            'default': 20
        }
    
    def parse_knowledge_graph(self, kg_json_str: str) -> Dict:
        """Parse knowledge graph JSON string"""
        try:
            # Clean the JSON string
            cleaned_json = kg_json_str.strip()
            if cleaned_json.startswith('```json'):
                cleaned_json = cleaned_json[7:]
            if cleaned_json.endswith('```'):
                cleaned_json = cleaned_json[:-3]
            
            kg_data = json.loads(cleaned_json)
            return kg_data
        except json.JSONDecodeError as e:
            st.error(f"Error parsing knowledge graph JSON: {e}")
            return self._create_fallback_graph(kg_json_str)
    
    def _create_fallback_graph(self, text: str) -> Dict:
        """Create a simple fallback graph when JSON parsing fails"""
        return {
            "nodes": [
                {"id": "analysis", "type": "disease", "label": "Medical Analysis", "properties": {}}
            ],
            "relationships": [],
            "reasoning_paths": []
        }
    
    def _calculate_layout(self, nodes: List[Dict], relationships: List[Dict]) -> Dict:
        """Calculate node positions using a simple circular layout"""
        positions = {}
        num_nodes = len(nodes)
        
        if num_nodes == 0:
            return positions
        
        # Group nodes by type for better layout
        node_groups = {}
        for node in nodes:
            node_type = node.get('type', 'default')
            if node_type not in node_groups:
                node_groups[node_type] = []
            node_groups[node_type].append(node)
        
        # Calculate positions
        angle_step = 2 * math.pi / num_nodes
        radius = max(3, num_nodes * 0.8)
        
        current_angle = 0
        for node_type, type_nodes in node_groups.items():
            type_radius = radius * (0.7 + 0.3 * list(node_groups.keys()).index(node_type) / len(node_groups))
            
            for i, node in enumerate(type_nodes):
                node_angle = current_angle + (i * angle_step / len(type_nodes))
                x = type_radius * math.cos(node_angle)
                y = type_radius * math.sin(node_angle)
                positions[node['id']] = {'x': x, 'y': y}
                current_angle += angle_step / len(type_nodes)
        
        return positions
    
    def create_plotly_visualization(self, kg_data: Dict) -> go.Figure:
        """Create interactive Plotly visualization"""
        nodes = kg_data.get('nodes', [])
        relationships = kg_data.get('relationships', [])
        
        if not nodes:
            # Create empty plot
            fig = go.Figure()
            fig.add_annotation(
                text="No nodes available to visualize",
                xref="paper", yref="paper",
                x=0.5, y=0.5, xanchor='center', yanchor='middle',
                showarrow=False, font=dict(size=16)
            )
            return fig
        
        # Calculate layout
        pos = self._calculate_layout(nodes, relationships)
        
        # Create edge traces
        edge_x = []
        edge_y = []
        edge_info = []
        
        for rel in relationships:
            source_id = rel.get('source', '')
            target_id = rel.get('target', '')
            
            if source_id in pos and target_id in pos:
                x0, y0 = pos[source_id]['x'], pos[source_id]['y']
                x1, y1 = pos[target_id]['x'], pos[target_id]['y']
                
                edge_x.extend([x0, x1, None])
                edge_y.extend([y0, y1, None])
                
                # Store edge info for hover
                edge_info.append({
                    'source': source_id,
                    'target': target_id,
                    'type': rel.get('type', 'unknown'),
                    'confidence': rel.get('confidence', 'N/A'),
                    'reasoning': rel.get('reasoning', 'No reasoning provided')
                })
        
        # Create edge trace
        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            line=dict(width=2, color='rgba(128,128,128,0.5)'),
            hoverinfo='none',
            mode='lines',
            showlegend=False
        )
        
        # Group nodes by type for separate traces
        node_traces = {}
        for node_type in self.node_colors.keys():
            node_traces[node_type] = go.Scatter(
                x=[], y=[],
                mode='markers+text',
                marker=dict(
                    size=self.node_sizes.get(node_type, 20),
                    color=self.node_colors.get(node_type, self.node_colors['default']),
                    line=dict(width=2, color='white')
                ),
                text=[],
                textposition="middle center",
                textfont=dict(size=10, color='white'),
                name=node_type.replace('_', ' ').title(),
                hovertemplate='<b>%{text}</b><br>Type: ' + node_type + '<br>ID: %{customdata}<extra></extra>',
                customdata=[]
            )
        
        # Add nodes to appropriate traces
        for node in nodes:
            if node['id'] not in pos:
                continue
                
            x, y = pos[node['id']]['x'], pos[node['id']]['y']
            node_type = node.get('type', 'default')
            
            if node_type not in node_traces:
                node_type = 'default'
            
            node_traces[node_type]['x'] += (x,)
            node_traces[node_type]['y'] += (y,)
            node_traces[node_type]['text'] += (node.get('label', node['id']),)
            node_traces[node_type]['customdata'] += (node['id'],)
        
        # Create figure
        fig_data = [edge_trace] + [trace for trace in node_traces.values() if len(trace['x']) > 0]
        fig = go.Figure(data=fig_data)
        
        fig.update_layout(
            title="Medical Knowledge Graph - Interactive Visualization",
            titlefont_size=16,
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=40),
            annotations=[
                dict(
                    text="Hover over nodes and edges for details. Drag to pan, scroll to zoom.",
                    showarrow=False,
                    xref="paper", yref="paper",
                    x=0.005, y=-0.002,
                    xanchor="left", yanchor="bottom",
                    font=dict(color="gray", size=12)
                )
            ],
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            plot_bgcolor='white',
            height=600
        )
        
        return fig
    
    def display_reasoning_paths(self, kg_data: Dict):
        """Display reasoning paths in a structured format"""
        reasoning_paths = kg_data.get('reasoning_paths', [])
        
        if reasoning_paths:
            st.subheader("Diagnostic Reasoning Paths")
            
            for i, path in enumerate(reasoning_paths, 1):
                confidence = path.get('confidence', 'N/A')
                logic = path.get('logic', 'No logic provided')
                
                with st.expander(f"Reasoning Path {i} (Confidence: {confidence})"):
                    st.write(f"**Logic:** {logic}")
                    
                    if 'path' in path and path['path']:
                        st.write("**Reasoning Steps:**")
                        path_nodes = path['path']
                        for j, node in enumerate(path_nodes):
                            if j < len(path_nodes) - 1:
                                st.write(f"{j+1}. {node} → {path_nodes[j+1]}")
                            else:
                                st.write(f"{j+1}. {node} (Final conclusion)")
    
    def display_relationships_table(self, kg_data: Dict):
        """Display relationships in a table format"""
        relationships = kg_data.get('relationships', [])
        
        if relationships:
            st.subheader("Medical Relationships")
            
            rel_data = []
            for rel in relationships:
                rel_data.append({
                    'From': rel.get('source', 'Unknown'),
                    'Relationship': rel.get('type', 'unknown'),
                    'To': rel.get('target', 'Unknown'),
                    'Confidence': rel.get('confidence', 'N/A'),
                    'Medical Reasoning': rel.get('reasoning', 'No reasoning provided')[:100] + '...' if len(rel.get('reasoning', '')) > 100 else rel.get('reasoning', '')
                })
            
            st.dataframe(rel_data, use_container_width=True)
    
    def render_knowledge_graph(self, kg_json_str: str):
        """Main function to render the complete knowledge graph"""
        if not kg_json_str or kg_json_str == "No knowledge graph available":
            st.warning("No knowledge graph data available")
            return
        
        try:
            # Parse the knowledge graph
            kg_data = self.parse_knowledge_graph(kg_json_str)
            
            # Create and display the interactive graph
            fig = self.create_plotly_visualization(kg_data)
            st.plotly_chart(fig, use_container_width=True)
            
            # Display additional information in columns
            col1, col2 = st.columns(2)
            
            with col1:
                self.display_reasoning_paths(kg_data)
            
            with col2:
                self.display_relationships_table(kg_data)
                
            # Display node summary
            nodes = kg_data.get('nodes', [])
            if nodes:
                st.subheader("Knowledge Graph Summary")
                node_types = {}
                for node in nodes:
                    node_type = node.get('type', 'unknown')
                    node_types[node_type] = node_types.get(node_type, 0) + 1
                
                summary_cols = st.columns(len(node_types))
                for i, (node_type, count) in enumerate(node_types.items()):
                    with summary_cols[i]:
                        st.metric(
                            label=node_type.replace('_', ' ').title(),
                            value=count,
                            delta=None
                        )
                        
        except Exception as e:
            st.error(f"Error rendering knowledge graph: {e}")
            st.code(kg_json_str, language="json")