package com.url.security.repository;




import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.url.security.model.Club;
import com.url.security.model.ClubType;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByType(ClubType type);
    List<Club> findByCategory(String category);
    List<Club> findByNameContainingAndTypeAndCategory(String name, ClubType type, String category);

    @Query("""
        SELECT c FROM Club c
        WHERE (:name IS NULL OR :name = '' OR LOWER(c.name) LIKE LOWER(CONCAT(:name, '%')))
          AND (:type IS NULL OR c.type = :type)
          AND (:category IS NULL OR :category = '' OR LOWER(c.category) LIKE LOWER(CONCAT('%', :category, '%')))
    """)
    List<Club> searchClubs(
        @Param("name") String name,
        @Param("type") ClubType type,
        @Param("category") String category
    );
}
