from sqlalchemy.orm import Session
from models.document import Document


def create_document(db: Session, document: Document):
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def get_document_by_id( db: Session,document_id: int) -> Document | None:

    return (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )
    
def get_accessible_document( db: Session, document_id: int, organization_id: int) -> Document | None:

    return (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.organization_id == organization_id
        )
        .first()
    )
    
def update_document_status( db,document_id: int, status: str):

    document = get_document_by_id( db, document_id )

    if document is None:
        return None

    document.status = status
    db.commit()
    db.refresh(document)
    return document

def get_documents(db, organization_id):
    return (
        db.query(Document)
        .filter(Document.organization_id == organization_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    


def delete_document(db, document):
    db.delete(document)
    db.commit()