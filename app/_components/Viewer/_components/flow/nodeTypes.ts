import { EntityNode } from "./nodes/EntityNode";
import { WeakEntityNode } from "./nodes/WeakEntityNode";
import { RelationshipNode } from "./nodes/RelationshipNode";
import { IdentifyingRelNode } from "./nodes/IdentifyingRelNode";
import { AttributeNode } from "./nodes/AttributeNode";
import { KeyAttributeNode } from "./nodes/KeyAttributeNode";
import { MultivaluedAttrNode } from "./nodes/MultivaluedAttrNode";
import { TextNode } from "./nodes/TextNode";

export const chenNodeTypes = {
  entity: EntityNode,
  weakEntity: WeakEntityNode,
  relationship: RelationshipNode,
  identifyingRelationship: IdentifyingRelNode,
  attribute: AttributeNode,
  keyAttribute: KeyAttributeNode,
  multivaluedAttribute: MultivaluedAttrNode,
  text: TextNode,
};
