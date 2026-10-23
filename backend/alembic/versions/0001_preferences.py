"""Accounts, sessions, declared preferences and recommendation controls."""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

from alembic import op

revision = "0001_preferences"
down_revision = None
branch_labels = None
depends_on = None


def user_fk(name, **kwargs):
    return sa.Column(name, sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), **kwargs)


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "profiles",
        user_fk("user_id", primary_key=True),
        sa.Column("display_name", sa.String(40), nullable=False),
        sa.Column("bio", sa.String(280), nullable=False, server_default=""),
        sa.Column("avatar", sa.String(16), nullable=False, server_default="👾"),
        sa.Column("discoverable", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("interests", pg.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("goals", pg.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("languages", pg.ARRAY(sa.Text()), nullable=False, server_default="{english}"),
        sa.Column("contact_modes", pg.ARRAY(sa.Text()), nullable=False, server_default="{text}"),
        sa.Column("communication_style", sa.String(20), nullable=False, server_default="flexible"),
        sa.Column("interaction_preference", sa.String(20), nullable=False, server_default="flexible"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("cardinality(interests) <= 30", name="ck_interest_limit"),
        sa.CheckConstraint("cardinality(languages) BETWEEN 1 AND 10", name="ck_language_limit"),
        sa.CheckConstraint("cardinality(contact_modes) BETWEEN 1 AND 3", name="ck_contact_modes"),
    )
    op.create_index("ix_profiles_interests_gin", "profiles", ["interests"], postgresql_using="gin")
    op.create_index("ix_profiles_languages_gin", "profiles", ["languages"], postgresql_using="gin")
    op.create_index("ix_profiles_discoverable", "profiles", ["discoverable"])
    op.create_table(
        "refresh_sessions",
        sa.Column("id", sa.UUID(), primary_key=True),
        user_fk("user_id", nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_refresh_sessions_user_id", "refresh_sessions", ["user_id"])
    op.create_table(
        "blocks",
        user_fk("user_id", primary_key=True),
        user_fk("target_id", primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("user_id <> target_id", name="ck_no_self_block"),
    )
    op.create_index("ix_blocks_target", "blocks", ["target_id"])
    op.create_table(
        "recommendation_feedback",
        user_fk("user_id", primary_key=True),
        user_fk("target_id", primary_key=True),
        sa.Column("action", sa.String(16), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("action IN ('dismiss', 'interested')", name="ck_feedback_action"),
    )
    op.create_table(
        "rate_limit_buckets",
        sa.Column("key", sa.String(64), primary_key=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_rate_limit_buckets_expires_at", "rate_limit_buckets", ["expires_at"])
    op.execute("""
        CREATE FUNCTION roleplay_jaccard(a text[], b text[]) RETURNS double precision
        LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
          SELECT CASE WHEN count(*) = 0 THEN 0.0
            ELSE count(*) FILTER (WHERE in_a AND in_b)::double precision / count(*) END
          FROM (
            SELECT term, bool_or(origin = 1) AS in_a, bool_or(origin = 2) AS in_b
            FROM (SELECT unnest(a) AS term, 1 AS origin UNION ALL SELECT unnest(b), 2) tagged
            GROUP BY term
          ) terms
        $$
    """)


def downgrade():
    op.execute("DROP FUNCTION roleplay_jaccard(text[], text[])")
    for table in ["rate_limit_buckets", "recommendation_feedback", "blocks", "refresh_sessions", "profiles", "users"]:
        op.drop_table(table)
