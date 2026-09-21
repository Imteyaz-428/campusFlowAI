from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"      # College Admin
    TEACHER = "teacher"
    STUDENT = "student"