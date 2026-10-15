
package com.xebia.lms.controller;

import com.xebia.lms.model.Course;
import com.xebia.lms.repository.CategoryRepository;
import com.xebia.lms.repository.CourseRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseControllerTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CourseController courseController;

    @Test
    void getCoursesReturnsList() {
        when(courseRepository.findCoursesWithFilters(null, null, null))
                .thenReturn(Collections.emptyList());

        assertTrue(courseController.getCourses(null, null, null).isEmpty());
    }

    @Test
    void getCourseBySlugReturnsCourseWhenFound() {
        Course course = new Course();

        when(courseRepository.findBySlug("java-basics"))
                .thenReturn(Optional.of(course));

        ResponseEntity<Course> response =
                courseController.getCourseBySlug("java-basics");

        assertEquals(200, response.getStatusCodeValue());
        assertSame(course, response.getBody());
    }

    @Test
    void getCourseBySlugReturnsNotFoundWhenMissing() {
        when(courseRepository.findBySlug("missing"))
                .thenReturn(Optional.empty());

        ResponseEntity<Course> response =
                courseController.getCourseBySlug("missing");

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void deleteCourseReturnsNotFoundWhenMissing() {
        when(courseRepository.findById("missing"))
                .thenReturn(Optional.empty());

        ResponseEntity<Void> response =
                courseController.deleteCourse("missing");

        assertEquals(404, response.getStatusCodeValue());
        verify(courseRepository, never()).delete(any(Course.class));
    }

    @Test
    void createCourseGeneratesIdAndSlug() {
        Course course = new Course();
        course.setTitle("Java Basics");

        when(courseRepository.save(any(Course.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Course result = courseController.createCourse(course);

        assertNotNull(result.getId());
        assertEquals("Java Basics", result.getTitle());
        assertEquals("java-basics", result.getSlug());

        verify(courseRepository, times(1)).save(course);
    }

    @Test
    void updateCourseChangesTitle() {
        Course existing = new Course();
        existing.setId("course-1");
        existing.setTitle("Old Title");

        Course details = new Course();
        details.setTitle("New Title");

        when(courseRepository.findById("course-1"))
                .thenReturn(Optional.of(existing));

        when(courseRepository.save(any(Course.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Course> response =
                courseController.updateCourse("course-1", details);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("New Title", response.getBody().getTitle());

        verify(courseRepository, times(1)).save(existing);
    }

    @Test
    void deleteCourseDeletesExistingCourse() {
        Course course = new Course();
        course.setId("course-1");

        when(courseRepository.findById("course-1"))
                .thenReturn(Optional.of(course));

        ResponseEntity<Void> response =
                courseController.deleteCourse("course-1");

        assertEquals(200, response.getStatusCodeValue());

        verify(courseRepository, times(1)).delete(course);
    }
}
